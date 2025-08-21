import TokenSwap from "./components/TokenSwap"
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react"
import { WalletModalProvider, WalletMultiButton, WalletDisconnectButton } from "@solana/wallet-adapter-react-ui"
import "@solana/wallet-adapter-react-ui/styles.css"
import { useState } from "react"

function App() {

  const [swapped, setSwapped] = useState(false)

  return (

    <div>

      <br></br>

      <ConnectionProvider endpoint={"https://api.devnet.solana.com"}>

        <WalletProvider wallets={[]} autoConnect>

          <WalletModalProvider>

            <TokenSwap swapped={swapped} setSwapped={setSwapped}></TokenSwap>

            <br></br>

            {!swapped && <div>
              
              <WalletMultiButton></WalletMultiButton>

              <br></br>

              <WalletDisconnectButton></WalletDisconnectButton>

            </div>}

          </WalletModalProvider>


        </WalletProvider>
      
      
      </ConnectionProvider>

    </div>

  )
}

export default App
