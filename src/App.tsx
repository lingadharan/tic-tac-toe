import { useState, useEffect } from 'react'
import './App.css'

const getStoredName = (key: string) => localStorage.getItem(key) || ''

export default function App() {
  const [playerX, setPlayerX] = useState(getStoredName('playerX'))
  const [playerO, setPlayerO] = useState(getStoredName('playerO'))
  const [nameInputDone, setNameInputDone] = useState(!!(getStoredName('playerX') && getStoredName('playerO')))
  const [errors, setErrors] = useState({ x: '', o: '' })

  const [boardSize, setBoardSize] = useState(3)
  const totalCells = boardSize * boardSize
  const [board, setBoard] = useState<(null | 'X' | 'O')[]>(Array(totalCells).fill(null))
  const [isPlayerX, setIsPlayerX] = useState(true)
  const [winner, setWinner] = useState<null | 'X' | 'O'>(null)
  const [isDraw, setIsDraw] = useState(false)

  const [scores, setScores] = useState({ X: 0, O: 0 })
  const [history, setHistory] = useState<(null | 'X' | 'O')[][]>([])

  function reset() {
    setBoard(Array(totalCells).fill(null))
    setIsPlayerX(true)
    setWinner(null)
    setIsDraw(false)
    setHistory([])
  }

  function restartGame() {
    setPlayerX('')
    setPlayerO('')
    setNameInputDone(false)
    localStorage.removeItem('playerX')
    localStorage.removeItem('playerO')
    reset()
  }

  function checkWinner(currentBoard: (null | 'X' | 'O')[]) {
    const lines = []
    for (let i = 0; i < boardSize; i++) {
      lines.push([...Array(boardSize).keys()].map(k => i * boardSize + k)) // rows
      lines.push([...Array(boardSize).keys()].map(k => k * boardSize + i)) // cols
    }
    lines.push([...Array(boardSize).keys()].map(k => k * boardSize + k)) // main diag
    lines.push([...Array(boardSize).keys()].map(k => k * boardSize + (boardSize - k - 1))) // anti diag

    for (const line of lines) {
      const [first, ...rest] = line
      if (currentBoard[first] && rest.every(i => currentBoard[i] === currentBoard[first])) {
        return currentBoard[first]
      }
    }

    return null
  }

  useEffect(() => {
    const result = checkWinner(board)
    if (result) {
      setWinner(result)
      setScores(prev => ({ ...prev, [result]: prev[result] + 1 }))
    } else if (board.every(cell => cell !== null)) {
      setIsDraw(true)
    }
  }, [board])

  function handleClick(index: number) {
    if (board[index] || winner) return
    const newBoard = [...board]
    newBoard[index] = isPlayerX ? 'X' : 'O'
    setHistory([...history, board])
    setBoard(newBoard)
    setIsPlayerX(!isPlayerX)
  }

  function undoMove() {
    const prev = history[history.length - 1]
    if (!prev) return
    setBoard(prev)
    setHistory(history.slice(0, -1))
    setIsPlayerX(!isPlayerX)
  }

  function handleStart(e: React.FormEvent) {
    e.preventDefault()
    const xSanitized = playerX.trim().substring(0, 15)
    const oSanitized = playerO.trim().substring(0, 15)

    const xValid = xSanitized.length > 0
    const oValid = oSanitized.length > 0

    setErrors({
      x: xValid ? '' : 'Name required for Player X',
      o: oValid ? '' : 'Name required for Player O'
    })

    if (xValid && oValid) {
      setPlayerX(xSanitized)
      setPlayerO(oSanitized)
      localStorage.setItem('playerX', xSanitized)
      localStorage.setItem('playerO', oSanitized)
      setNameInputDone(true)
      reset()
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
            maxLength={15}
            value={playerX}
            onChange={(e) => setPlayerX(e.target.value)}
          />
          {errors.x && <span className="error">{errors.x}</span>}

          <input
            type="text"
            placeholder="Player O Name"
            maxLength={15}
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

      <div className="scoreboard">
        <span>{playerX} (X): {scores.X}</span>
        <span>{playerO} (O): {scores.O}</span>
      </div>

      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${boardSize}, 80px)`
        }}
      >
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

      <div className="controls">
        <button className="reset-button" onClick={reset}>Next Round</button>
        <button className="undo-button" onClick={undoMove}>Undo</button>
        <button className="restart-button" onClick={restartGame}>Restart</button>
      </div>
    </div>
  )
}
