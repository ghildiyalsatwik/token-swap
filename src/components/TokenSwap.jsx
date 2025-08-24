import { useConnection, useWallet } from '@solana/wallet-adapter-react'
import { useState } from 'react'
import { getCpmmPdaAmmConfigId, Raydium, DEVNET_PROGRAM_ID, getCreatePoolKeys, CurveCalculator, FeeOn, TxVersion } from '@raydium-io/raydium-sdk-v2'
import BN from "bn.js"
import { PublicKey } from '@solana/web3.js'

export default function TokenSwap({swapped, setSwapped}) {

    const wallet = useWallet()

    const { connection } = useConnection()

    const [amount, setAmount] = useState(0)

    const [tokens, setTokens] = useState([{name: "SOL", mint: "So11111111111111111111111111111111111111111"},
        {name: "TEST", mint: "5wBLaYUPxw9iuZNa5K6yn1zLVYauESXSJze1yu7XCmz2"},
        {name: "LP", mint: "yon4Qj3SLQgAxEx8f7bKHQVucjE77HVTzQGzzuc7sLW"}])

    const [token1, setToken1] = useState(tokens[0].mint)

    const [token2, setToken2] = useState(tokens[1].mint)

    function flipTokens() {

        const temp = token2
        
        setToken2(token1)

        setToken1(temp)
    }

    function goBack() {

        setAmount(0)

        setSwapped(false)
    }

    async function swapFunc() {

        const owner = wallet.publicKey

        const cluster = 'devnet'

        const raydium = await Raydium.load({owner,

            connection,
        
            cluster
        })

        let tok1 = token1

        let tok2 = token2

        if(tok1 === "So11111111111111111111111111111111111111111") {

            tok1 = "So11111111111111111111111111111111111111112"
        
        }

        if(tok2 === "So11111111111111111111111111111111111111111") {

            tok2 = "So11111111111111111111111111111111111111112"
        }

        const isFront = new BN(new PublicKey(tok1).toBuffer()).lte(new BN(new PublicKey(tok2).toBuffer()))

        let [mintA, mintB] = isFront ? [tok1, tok2] : [tok2, tok1]

        const [mintAPubkey, mintBPubkey] = [new PublicKey(mintA), new PublicKey(mintB)]

        const feeConfigs = await raydium.api.getCpmmConfigs()

        feeConfigs.forEach((config) => {

            config.id = getCpmmPdaAmmConfigId(DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_PROGRAM, config.index).publicKey.toBase58()
        
        })

        let poolKeys = getCreatePoolKeys({

            programId: DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_PROGRAM,

            configId: new PublicKey(feeConfigs[0].id),

            mintA: mintAPubkey,

            mintB: mintBPubkey
        
        })

        const poolId = poolKeys.poolId

        const info = await connection.getAccountInfo(poolId)

        if(!info) {

            alert("This pool does not exist!")

            return
        
        }

        const poolID = poolId.toBase58()

        const decimals = 9

        const inputAmount = new BN(Math.floor(parseFloat(amount) * 10 ** decimals))

        const inputMint = tok1

        let poolInfo

        let poolKEYS 

        let rpcData

        const data = await raydium.cpmm.getPoolInfoFromRpc(poolID)

        poolInfo = data.poolInfo

        poolKEYS = data.poolKeys

        rpcData = data.rpcData

        if(inputMint !== poolInfo.mintA.address && inputMint !== poolInfo.mintB.address) {

            alert("Input mint does not match pool")

            return
        }

        const baseIn = inputMint === poolInfo.mintA.address


        const swapResult = CurveCalculator.swapBaseInput(

            inputAmount,

            baseIn ? rpcData.baseReserve : rpcData.quoteReserve,

            baseIn ? rpcData.quoteReserve : rpcData.baseReserve,

            rpcData.configInfo.tradeFeeRate,

            rpcData.configInfo.creatorFeeRate,

            rpcData.configInfo.protocolFeeRate,

            rpcData.configInfo.fundFeeRate,

            rpcData.feeOn === FeeOn.BothToken || rpcData.feeOn === FeeOn.OnlyTokenB
        )

        poolKeys = poolKEYS


        const { execute, transaction } = await raydium.cpmm.swap({

            poolInfo,

            poolKeys,

            inputAmount,

            swapResult,

            slippage: 0.001,

            baseIn,

            txVersion: TxVersion.V0,
        })

        transaction.feePayer = wallet.publicKey

        const latestBlockhash = await connection.getLatestBlockhash()

        transaction.recentBlockhash = latestBlockhash.blockhash

        try {
            
            await wallet.sendTransaction(transaction, connection)

        } catch(err) {

            console.log("Transaction failed!")

            return
        }

        setSwapped(true)

    }

    return (

        <div>

            {!swapped && <div>

                <h1>Token Swap</h1>

                <label>Select the tokens to swap</label>

                <br></br>
                
                <label>From</label>

                <br></br>

                <select value={token1} onChange={(e) => setToken1(e.target.value)}>

                    {tokens.map((token, index) => (

                        token.mint !== token2 && <option key={index} value={token.mint}>{token.name}</option>

                    ))}

                </select>

                <br></br>

                <input style = {{width: 215}} type="text" placeholder='Enter the amount you want to swap:' onChange={(e) => setAmount(e.target.value)}></input>

                <br></br>

                <label>To</label>

                <br></br>

                <select value={token2} onChange={(e) => setToken2(e.target.value)}>

                    {tokens.map((token, index) => (

                        token.mint !== token1 && <option key={index} value={token.mint}>{token.name}</option>
                    ))}
                
                </select>

                <br></br>

                <br></br>

                <button onClick={flipTokens}>Flip tokens</button>

                <br></br>

                
                <br></br>

                <button onClick={swapFunc}>Swap</button>

            </div>}

            {swapped && <div>
                
                <div>Tokens have been swapped. Please check your wallet.</div>

                <button onClick={goBack}>Swap More</button>    
            
            </div>}

        </div>
    )
}