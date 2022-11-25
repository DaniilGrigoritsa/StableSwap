import { ConnectWallet } from "@thirdweb-dev/react";


export function Navbar() {
  return (
    <div className="connect">
      <ConnectWallet />
    </div>
  );
}