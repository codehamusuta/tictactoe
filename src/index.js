import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// class Square extends React.Component {
//     render() {
//       return (
//         <button 
//             className="square" 
//             onClick={() => this.props.onClick()}
//         >
//           {this.props.value}
//         </button>
//       );
//     }
//   }

//replace Square class above to function components
//both are equivalent 
function Square(props) {
    return (
        <button 
            className="square" 
            onClick={() => props.onClick()}
        >
            {props.value}
        </button>
    )
}
  
class Board extends React.Component {
    // Refactor: shifted to parent to enable history
    // constructor (props) {
    //     super(props);
    //     this.state = {
    //         squares: Array(9).fill(null),
    //         xIsNext: true,
    //     }
    // }
    // handleClick(i) {
    //     /*
    //     use slice to create a copy of squares array instead of modifying the existing array
    //     so as to achieve immutability
    //     advantages: 
    //         (1) simplicity, 
    //         (2) allows time travel, 
    //         (3) easy to detect changes,
    //         (4) allows for 'pure' react components
    //     */
    //     const squares = this.state.squares.slice(); 

    //     //ignore a click if there is a winner or square is already filled
    //     if (calculateWinner(squares) || squares[i]) {
    //         return;
    //     }
    //     squares[i] = this.state.xIsNext ? 'X' : 'O';
    //     this.setState({
    //         squares: squares,
    //         xIsNext: !this.state.xIsNext,
    //     });
    // }

    renderSquare(i) {
        return (
        <Square 
            value={this.props.squares[i]}
            onClick={() => this.props.onClick(i)}
        />
        );
    }

    render() {
        return (
        <div>
            <div className="board-row">
                {this.renderSquare(0)}
                {this.renderSquare(1)}
                {this.renderSquare(2)}
            </div>
            <div className="board-row">
                {this.renderSquare(3)}
                {this.renderSquare(4)}
                {this.renderSquare(5)}
            </div>
            <div className="board-row">
                {this.renderSquare(6)}
                {this.renderSquare(7)}
                {this.renderSquare(8)}
            </div>
        </div>
        );
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null),
                movePos: null,
            }],
            stepNumber: 0,
            xIsNext: true, 
        };
    }

    handleClick(i) {
        // const history = this.state.history;
        // ensusre that if we go back in time and make a new move, we throw away future history
        const history = this.state.history.slice(0, this.state.stepNumber + 1); 
        const current = history[history.length - 1];
        const squares = current.squares.slice(); 

        //ignore a click if there is a winner or square is already filled
        if (calculateWinner(squares) || squares[i]) {
            return;
        }
        squares[i] = this.state.xIsNext ? 'X' : 'O';
        this.setState({
            //use concat instead of push because concat doesn't mutate the original
            history: history.concat([{
                squares: squares,
                movPos: i
            }]),
            stepNumber: history.length, //not +1 because history is the old array
            xIsNext: !this.state.xIsNext,
        });
    }

    jumpTo(step) {
        this.setState({
            stepNumber: step, 
            xIsNext: (step % 2) === 0,
        })
    }

    getPosition(i) {
        const row = ~~(i/3) + 1;
        const col = i%3 + 1;
        return `(${row},${col})`
    }

    moveDesc(step, move) {
        if (move == 0){
            return ''
        } else {
            const player = (move % 2) === 0 ? 'X': 'O';
            const moveLoc = this.getPosition(step.movPos);
            return player + ' marked ' + moveLoc;
        }
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares);

        const moves = history.map((step, move) => {
            
            const desc2 = move ? 
                'Go to move #' + move :
                'Go to game start';

            
            //move # is unique in this problem
            return (
                <li className="history-button" key={move}> 
                    <button onClick={() => this.jumpTo(move)}>{desc2}</button>
                    <span>{this.moveDesc(step, move)}</span>
                </li>
            );
        });

        let status;
        if (winner) {
            status = 'Winner: ' + winner;
        } else {
            status = 'Next player: ' + (this.state.xIsNext? 'X': 'O');
        }

        return (
        <div className="game">
            <div className="game-board">
            <Board 
                squares={current.squares}
                onClick={(i) => this.handleClick(i)}
            />
            </div>
            <div className="game-info">
                <div>{status}</div>
                <ol>{moves}</ol>
            </div>
        </div>
        );
    }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);

function calculateWinner(squares) {
    const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];
    for (let i = 0; i < lines.length; i++) {
        const [a, b, c] = lines[i];
        if (squares[a] && squares[a] === squares[b] && 
            squares[a] === squares[c]) {
                return squares[a];
            }
    }
    return null;
}

