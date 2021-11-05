import hash from 'hash.js';
import { TransitionParams, TransitionValue } from 'tyron/dist/blockchain/tyronzil';

export async function HashDexOrder(elements: any[]): Promise<string | undefined>{
    let hash_;
    for(const element of elements){
        const h = hash.sha256().update(element).digest('hex');

        if( hash_ === undefined ){
            hash_ = h
        } else{
            hash_ = hash_ + h;
        }
    }
    return hash_;
}

export async function AddLiquidity(
    signature: any,
    id: string,
    amount: string,
    tyron: TransitionValue
): Promise<TransitionParams[]> {
    const params = [];
    
    const sig: TransitionParams = {
        vname: 'signature',
        type: 'Option ByStr64',
        value: signature,
    };
    params.push(sig);
    
    const id_: TransitionParams = {
        vname: 'addrID',
        type: 'String',
        value: id,
    };
    params.push(id_);

    const amount_: TransitionParams = {
        vname: 'amount',
        type: 'Uint128',
        value: amount,
    };
    params.push(amount_);

    const tyron_: TransitionParams = {
        vname: 'tyron',
        type: 'Option Uint128',
        value: tyron,
    };
    params.push(tyron_);
    return params;
}

export async function RemoveLiquidity(
    signature: any,
    id: string,
    amount: string,
    minZil: string,
    minToken: string,
    tyron: TransitionValue
): Promise<TransitionParams[]> {
    const params = [];
    
    const sig: TransitionParams = {
        vname: 'signature',
        type: 'Option ByStr64',
        value: signature,
    };
    params.push(sig);
    
    const id_: TransitionParams = {
        vname: 'addrID',
        type: 'String',
        value: id,
    };
    params.push(id_);

    const amount_: TransitionParams = {
        vname: 'amount',
        type: 'Uint128',
        value: amount,
    };
    params.push(amount_);

    const minzil: TransitionParams = {
        vname: 'minZilAmount',
        type: 'Uint128',
        value: minZil,
    };
    params.push(minzil);

    const mintoken: TransitionParams = {
        vname: 'minTokenAmount',
        type: 'Uint128',
        value: minToken,
    };
    params.push(mintoken);

    const tyron_: TransitionParams = {
        vname: 'tyron',
        type: 'Option Uint128',
        value: tyron,
    };
    params.push(tyron_);
    return params;
}
