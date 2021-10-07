import { DidScheme, Resolver, DidDocument } from 'tyron';

export const isValidUsername = (username: string) =>
    /^[\w\d_]+$/.test(username) && username.length > 6 && username.length < 15;

const network = DidScheme.NetworkNamespace.Testnet;
export const initTyron = '0x25a7bb9d8b2a82ba073a3ceb3b24b04fb0a39260'; // @todo Resolver.InitTyron.Testnet vs env variable
    
export const fetchAddr = async ({
    username,
    domain
}: {
    username: string;
    domain: string;
}) => {
    const addr = await Resolver.default
        .resolveDns(network, initTyron, username, domain)
        .catch((err) => {
            throw err;
        });

    return addr;
};

export const resolve = async ({ addr }: { addr: string }) => {
    const did_doc: any[] = [];
    const resolution_input: DidDocument.ResolutionInput = {
        addr: addr,
        metadata: {
            accept: DidDocument.Accept.contentType //resolve it as DID Document
        }
    };
    await DidDocument.default
        .resolution(network, resolution_input)
        .then(async (did_resolved) => {
            const doc = did_resolved as DidDocument.default;

            did_doc.push(['Decentralized identifier', [doc.id]]);
            if (doc.service !== undefined) {
                const services = [];
                for (const service of doc.service) {
                    const hash_index = service.id.lastIndexOf('#');
                    const id = service.id.substring(hash_index + 1)+ ': ';
                    services.push([id, service.uri]);
                }
                did_doc.push(['DID services', services]);
            }
            if (doc.publicKey) {
                did_doc.push([
                    'General-purpose public key',
                    [doc.publicKey.publicKeyBase58]
                ]);
            }
            if (doc.authentication !== undefined) {
                did_doc.push([
                    'Authentication public key',
                    [doc.authentication.publicKeyBase58]
                ]);
            }
            if (doc.assertionMethod !== undefined) {
                did_doc.push([
                    'Assertion public key',
                    [doc.assertionMethod.publicKeyBase58]
                ]);
            }
            if (doc.capabilityDelegation !== undefined) {
                did_doc.push([
                    'Delegation public key',
                    [doc.capabilityDelegation.publicKeyBase58]
                ]);
            }
            if (doc.capabilityInvocation !== undefined) {
                did_doc.push([
                    'Invocation public key',
                    [doc.capabilityInvocation.publicKeyBase58]
                ]);
            }
            if (doc.keyAgreement !== undefined) {
                did_doc.push([
                    'Agreement public key: ',
                    [doc.keyAgreement.publicKeyBase58]
                ]);
            }
        });

    return did_doc;
};
