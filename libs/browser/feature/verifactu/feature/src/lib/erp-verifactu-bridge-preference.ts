const PREFER_BRIDGE_KEY = 'erp_verifactu_prefer_bridge';

export function erpVerifactuPrefersBridge(): boolean {
  if (typeof sessionStorage === 'undefined') {
    return false;
  }
  return sessionStorage.getItem(PREFER_BRIDGE_KEY) === '1';
}

export function setErpVerifactuPreferBridge(prefer: boolean): void {
  if (typeof sessionStorage === 'undefined') {
    return;
  }
  if (prefer) {
    sessionStorage.setItem(PREFER_BRIDGE_KEY, '1');
  } else {
    sessionStorage.removeItem(PREFER_BRIDGE_KEY);
  }
}
