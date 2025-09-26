declare module 'wagmi';
declare module '@web3modal/wagmi';
declare module '@web3modal/wagmi/react';

// Vite-injected build flags
declare const __HAS_WAGMI__: boolean
declare const __HAS_WEB3MODAL__: boolean

// Allow importing JSON files (contract artifacts)
declare module '*.json' {
	const value: any
	export default value
}
