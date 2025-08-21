import { useState } from 'react'

export default function TokenSwap({swapped, setSwapped}) {

    const [tokens, setTokens] = useState([{name: "SOL", mint: "So11111111111111111111111111111111111111111"},
        {name: "TEST", mint: "5wBLaYUPxw9iuZNa5K6yn1zLVYauESXSJze1yu7XCmz2"},
        {name: "LP", mint: "yon4Qj3SLQgAxEx8f7bKHQVucjE77HVTzQGzzuc7sLW"}])

    const [token1, setToken1] = useState(tokens[0].mint)

    const [token2, setToken2] = useState(tokens[1].mint)

    return (

        <div>

            <h1>Token Swap</h1>

            <label>Select the tokens to swap</label>

            <select value={token1} onChange={(e) => setToken1(e.target.value)}>

                {tokens.map((token, index) => (

                    token.mint !== token2 && <option key={index} value={token.mint}>{token.name}</option>

                ))}

            </select>

            <br></br>

            <select value={token2} onChange={(e) => setToken2(e.target.value)}>

                {tokens.map((token, index) => (

                    token.mint !== token1 && <option key={index} value={token.mint}>{token.name}</option>
                ))}
            
            </select>

            
            <br></br>

            <button>Swap</button>

        </div>
    )
}