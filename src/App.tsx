import { useState, useEffect } from 'react'
import './App.css'

export default function App() {
  const [playerX, setPlayerX] = useState('')
  const [playerO, setPlayerO] = useState('')
  const [nameInputDone, setNameInputDone] = useState(false)
  const [errors, setErrors] = useState({ x: '', o: '' })

  const [board, setBoard] = useState<(null | 'X' | 'O')[]>(Array(9).fill(null))
  const [isPlayerX, setIsPlayerX] = useState(true)
  const [winner, setWinner] = useState<null | 'X' | 'O'>(null)
  const [isDraw, setIsDraw] = useState(false)

  function reset() {
    setBoard(Array(9).fill(null))
    setIsPlayerX(true)
    setWinner(null)
    setIsDraw(false)
  }

  function checkWinner(currentBoard: (null | 'X' | 'O')[]) {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ]

    for (let [a, b, c] of lines) {
      if (
        currentBoard[a] &&
        currentBoard[a] === currentBoard[b] &&
        currentBoard[a] === currentBoard[c]
      ) {
        return currentBoard[a]
      }
    }

    return null
  }

  useEffect(() => {
    const result = checkWinner(board)
    if (result) {
      setWinner(result)
    } else if (board.every(cell => cell !== null)) {
      setIsDraw(true)
    }
  }, [board])

  function handleClick(index: number) {
    if (board[index] || winner) return

    const newBoard = [...board]
    newBoard[index] = isPlayerX ? 'X' : 'O'
    setBoard(newBoard)
    setIsPlayerX(!isPlayerX)
  }

  function handleStart(e: React.FormEvent) {
    e.preventDefault()
    const xValid = playerX.trim().length > 0
    const oValid = playerO.trim().length > 0

    setErrors({
      x: xValid ? '' : 'Name required for Player X',
      o: oValid ? '' : 'Name required for Player O'
    })

    if (xValid && oValid) {
      setNameInputDone(true)
    }
  }

  if (!nameInputDone) {
    return (
      <div className="start-screen">
        <h1>Enter Player Names</h1>
        <form onSubmit={handleStart} className="name-form">
          <input
            type="text"
            placeholder="Player X Name"
            value={playerX}
            onChange={(e) => setPlayerX(e.target.value)}
          />
          {errors.x && <span className="error">{errors.x}</span>}

          <input
            type="text"
            placeholder="Player O Name"
            value={playerO}
            onChange={(e) => setPlayerO(e.target.value)}
          />
          {errors.o && <span className="error">{errors.o}</span>}

          <button type="submit" className="start-button">Start Game</button>
        </form>
      </div>
    )
  }

  return (
    <div className={`container ${winner ? 'winner-animation' : ''}`}>
      <h1>Tic Tac Toe</h1>
      <h2>
        {winner
          ? `🎉 Winner: ${winner === 'X' ? playerX : playerO}`
          : isDraw
            ? "It's a draw!"
            : `Next: ${isPlayerX ? playerX : playerO}`}
      </h2>
      <div className="grid">
        {board.map((val, idx) => (
          <button
            key={idx}
            className={`cell ${val ? 'filled' : ''}`}
            onClick={() => handleClick(idx)}
          >
            {val}
          </button>
        ))}
      </div>
      <button className="reset-button" onClick={reset}>Reset</button>
    </div>
  )
}
