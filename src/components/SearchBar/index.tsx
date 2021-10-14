import React, { useState } from 'react';
import {
    SMART_CONTRACTS_URLS,
    VALID_SMART_CONTRACTS
} from '../../constants/tyron';
import { DOMAINS } from '../../constants/domains';
import { fetchAddr, isValidUsername, resolve } from './utils';
import { PublicIdentity, BuyNFTUsername, SSIWallet } from '../index';
import styles from './styles.module.scss';
import { updateUser } from 'src/store/user';
import { ZilPayBase } from '../ZilPay/zilpay-base';
import { $wallet } from 'src/store/wallet';
import { useStore } from 'effector-react';
import { $contract, updateContract } from 'src/store/contract';
import { updateDid } from 'src/store/did-doc';
import { $connected } from 'src/store/connected';
import { $net } from 'src/store/wallet-network';
import { updateLoggedIn } from 'src/store/loggedIn';
import { updateDonation } from 'src/store/donation';
import { $isAdmin, updateIsAdmin } from 'src/store/admin';

const zilpay = new ZilPayBase();

function SearchBar() {
    const zil_address = useStore($wallet);
    const is_connected = useStore($connected);
    const net = useStore($net);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [input, setInput] = useState('');
    
    const [register, setRegister] = useState(false);
    
    const [username, setName] = useState('');
    const [domain, setDomain] = useState('');
    const [exists, setExists] = useState(false);
    
    const [created, setCreated] = useState(false);
    
    const [hideWallet, setHideWallet] = useState(true);
    const [displayLegend, setDisplay] = useState('access SSI wallet');
    
    const spinner = (
        <i className="fa fa-lg fa-spin fa-circle-notch" aria-hidden="true"></i>
    );

    const handleSearchBar = ({
        currentTarget: { value }
    }: React.ChangeEvent<HTMLInputElement>) => {
        setError('');
        setExists(false);
        setRegister(false);
        setCreated(false);
        setHideWallet(true);
        setDisplay('access SSI wallet');

        setInput(value.toLowerCase());
        const [name = '', domain = ''] = value.split('.');
        setName(name.toLowerCase());
        setDomain(domain.toLowerCase());
        updateLoggedIn(null);
        updateDonation(null);
    };

    const handleOnKeyPress = ({
        key
    }: React.KeyboardEvent<HTMLInputElement>) => {
        if (key === 'Enter') {
            getResults();
        }
    };

    const resolveUser = async () => {
        updateUser({
            nft: username,
            domain: domain
        });
        if (isValidUsername(username) || username === 'tyron') {
            await fetchAddr({ username, domain })
            .then(async (addr) => {
                setExists(true);
                const doc = await resolve({ addr })
                .then( did_doc => {
                    setCreated(true)
                    return did_doc
                })
                .catch(() => {
                    return null
                });
                updateDid(doc);
                const this_admin = await zilpay.getSubState(
                    addr,
                    'admin_'
                );
                updateContract({
                    addr: addr,
                    base16: this_admin,
                })
            })
            .catch(() => {
                switch (net) {
                    case 'testnet':
                        if( domain === 'did' ){ setRegister(true) } else {
                            setError(`uninitialized identity. First, buy the ${username}.did NFT Username.`)
                        }
                        break;
                    default:
                        setError(`not available on ${net}.`)
                        break;
                }
            }); 
        } else {
            setError('a username must be between 7 and 15 characters.');
        }
    };

    const getResults = async () => {    
        setLoading(true);
        setError('');
        setExists(false);
        setRegister(false);
        setCreated(false);
        setHideWallet(true);
        setDisplay('access SSI wallet');
        switch (domain) {
            case DOMAINS.TYRON:
                if (VALID_SMART_CONTRACTS.includes(username))
                    window.open(
                        SMART_CONTRACTS_URLS[
                            username as unknown as keyof typeof SMART_CONTRACTS_URLS
                        ]
                    );
                else setError('invalid smart contract');
                break;
            case DOMAINS.COOP: await resolveUser();
            break;
            case DOMAINS.DID: await resolveUser();
            break;
            default: setError('valid domains are .did & .coop');
        }
        setLoading(false);
    };

    const contract = $contract.getState();
    const is_admin = $isAdmin.getState();
    if( contract?.base16 === zil_address?.base16.toLowerCase() ){
        updateIsAdmin(true);
    } else {
        updateIsAdmin(false)
    }

    return (
        <div className={styles.container}>
            <label htmlFor="">
                Type a username to access their SSI public identity
            </label>
            <div className={styles.searchDiv}>
                <input
                    type="text"
                    className={styles.searchBar}
                    onChange={handleSearchBar}
                    onKeyPress={handleOnKeyPress}
                    value={input}
                    placeholder="If the NFT username is available, you can buy it!"
                    autoFocus
                />
                <div>
                    <button onClick={getResults} className={styles.searchBtn}>
                        {loading ? spinner : <i className="fa fa-search"></i>}
                    </button>
                </div>
            </div>
            {
                error !== '' &&
                    <code>Error: {error}</code>
            }
            {
                register &&
                    <BuyNFTUsername />

            }
            {
                exists && displayLegend === 'access SSI wallet' && error === '' &&
                    <PublicIdentity
                        {...{
                            doc: created
                        }}
                    />
            }
            {
                !hideWallet && is_connected && is_admin &&
                    <SSIWallet 
                        {...{
                            name: username,
                            domain
                        }}
                    />
            }
            {      
                exists && is_connected && hideWallet && is_admin && !loading &&
                    <div style={{ marginTop: '9%' }}>
                        <button
                            type="button"
                            className={styles.button}
                            onClick={() => { 
                                setHideWallet(false);
                                setDisplay('hide wallet')
                            }}
                        >
                            <p className={styles.buttonShow}>
                                {displayLegend}
                            </p>
                        </button>
                    </div>
            }
            {      
                !hideWallet && is_connected &&
                    <div style={{ marginTop: '7%' }}>
                        <button
                            type="button"
                            className={styles.button}
                            onClick={() => { 
                                setHideWallet(true);
                                setDisplay('access SSI wallet')
                            }}
                        >
                            <p className={styles.buttonHide}>
                                {displayLegend}
                            </p>
                        </button>
                    </div>
            }
        </div>
    );
}
// @todo research/decide which router (consider working with next.js) & explain use of <>
export default SearchBar;
