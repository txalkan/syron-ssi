import React from 'react';
import * as tyron from 'tyron'
import styles from './styles.module.scss';
import { useStore } from 'effector-react';
import { ZilPayBase } from '../ZilPay/zilpay-base';
import { $new_wallet, updateNewWallet } from 'src/store/new-wallet';
import { $user } from 'src/store/user';
import { DeployDid, LogIn, TyronDonate } from '..';
import { $loggedIn } from 'src/store/loggedIn';
import { $connected } from 'src/store/connected';
import { $donation, updateDonation } from 'src/store/donation';

function BuyNFTUsername() {
    const user = $user.getState();
    const new_wallet = useStore($new_wallet);
    const is_connected = useStore($connected);
    const logged_in = useStore($loggedIn);
    const donation = useStore($donation);
    
    const handleBuy = async () => {
        const zilpay = new ZilPayBase();
        let addr;
        if ( new_wallet !== null ){
            addr = new_wallet;
        } else {
            addr = logged_in?.address as string;
        }
        const username = user?.nft as string;
        alert(`You're about to buy the ${user?.nft} NFT Username for $ZIL 100. You're also donating $ZIL ${donation} to Tyron.`);
        const tyron_ = await tyron.TyronZil.default.OptionParam(tyron.TyronZil.Option.some, 'Uint128', String(Number(donation)*1e12));
        const tx_params = await tyron.TyronZil.default.BuyNFTUsername(username, tyron_);
        
        const res = await zilpay.call({
            contractAddress: addr,
            transition: 'BuyNFTUsername',
            params: tx_params as unknown as Record<string, unknown>[],
            amount: String(100 + Number(donation))
        });
        alert(`The transaction was successful! ID: ${res.ID}. Wait a little bit, and then search for ${user?.nft}.did again to access your public identity and SSI wallet.`)
        updateNewWallet(null);
        updateDonation(null);
        //@todo-ux add link to the transaction on devex.zilliqa.com
        //@todo-ui better alert
    };

    return (
        <>
            <h2 style={{ marginBottom: '6%' }}>
                Buy{' '}
                <span className={styles.username}>
                    {user?.nft}
                </span>
                {' '}NFT Username
            </h2>
            {
                !is_connected &&
                    <code>This NFT Username is available. To buy it, you must sign in with ZilPay.</code>
            }
            {
                is_connected && new_wallet !== null && logged_in === null &&
                    //@todo-net wait until contract deployment got confirmed
                    <h4>
                        You have a new DID<span className={styles.x}>x</span>Wallet at this address: <span className={styles.x}>{new_wallet}</span>
                    </h4>
            }
            {
                is_connected && logged_in  !== null && logged_in.username &&
                    <h4>
                        You have logged in with <span className={styles.x}>{logged_in?.username}.did</span>
                    </h4>
            }
            {
                is_connected && logged_in  !== null && !logged_in.username &&
                    <h4>
                        You have logged in with <span className={styles.x}>{logged_in?.address}</span>
                    </h4>
            }
            {
                is_connected && ( new_wallet !== null || logged_in !== null ) &&
                    <>
                        <TyronDonate />
                        {
                            donation !== null &&
                                <div style={{ marginTop: '6%' }}>
                                    <button className={styles.button} onClick={handleBuy}>
                                        Buy{' '}
                                            <span className={styles.username}>
                                                {user?.nft}
                                            </span>
                                        {' '}NFT Username
                                    </button>
                                </div>
                        }
                    </>
            }
            {
                is_connected && new_wallet === null && logged_in === null &&
                    <div>
                        <h3>First:</h3>
                        <ul>
                            <li>
                                <code>- Create a new DIDxWallet:</code>
                                <div className={ styles.container}>
                                    <DeployDid />
                                </div>
                            </li>
                            <li>
                                <code>- Or log in to one of your wallets:</code>
                                <div style={{ marginLeft: '8%' }}>
                                    <LogIn />
                                </div>
                            </li>
                            
                            
                        </ul>
                    </div>
            }
        </>
    );
}

export default BuyNFTUsername;
