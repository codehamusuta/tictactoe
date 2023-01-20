import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

//this is a function component
function Square(props) {
    return (
        <button 
            // className="square"
            className={"square " + (props.className || "")} 
            onClick={() => props.onClick()}
        >
            {props.value}
        </button>
    )
}
  
class Board extends React.Component {
    renderSquare(i) {
        return (
        <Square
            key={i}
            value={this.props.squares[i]}
            onClick={() => this.props.onClick(i)}
            className={this.props.winningSquares.includes(i) ? "highlight": ""}
        />
        );
    }

    renderRow(row) {
        const items = []
        let i;
        for (let col = 0; col < 3; col++) {
            i = row*3 + col;
            items.push(this.renderSquare(i));
        }
        return (
            <div className="board-row" key={row}>{items}</div>
        )
    };

    render() {
        const rows = [];
        for (let row = 0; row < 3; row++) {
            rows.push(this.renderRow(row));
        }
        return <div>{rows}</div>
    }
}

class MoveHistory extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            reverse: false,
        }
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
            return '[' + player + ' marked ' + moveLoc + ']';
        }
    }

    toggleDirection() {
        this.setState({
            reverse: !this.state.reverse
        });
    }
    
    render() {
        const moves = this.props.history.map((step, move) => {
            //render all steps
            const desc2 = move ? 
                'Go to move #' + move :
                'Go to game start';

            const className = `history-button ${move == this.props.stepNumber? "selected": null}`

            //move # is unique in this problem
            return (
                <li className={className} key={move}>
                    <span>{move+1}.</span>
                    <button onClick={() => this.props.jumpTo(move)}>{desc2}</button>
                    <span>{this.moveDesc(step, move)}</span>
                </li>
            );
        });

        return (
            <div className="game-info">
                <h4>Move History 
                    <button 
                        className="toggle"
                        onClick={()=>this.toggleDirection()}
                        title="Change move history order"
                    >
                        <i className={this.state.reverse? "arrow up": "arrow down"}></i>
                    </button>
                </h4>
                <ol>{this.state.reverse? moves.reverse(): moves}</ol>
            </div>    
        )
    }
}

class Game extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            history: [{
                squares: Array(9).fill(null),
                movePos: null,  //track which square current player marks [0 - 9]
            }],
            stepNumber: 0,  //tracks which step to show on the board
            xIsNext: true
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
        //update stepNumber to show step
        this.setState({
            stepNumber: step, 
            xIsNext: (step % 2) === 0,
        })
    }

    render() {
        const history = this.state.history;
        const current = history[this.state.stepNumber];
        const winner = calculateWinner(current.squares);

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
                    winningSquares={winner ? calculateWinningSquares(current.squares): []}
                />
                <h5>{status}</h5>
            </div>
            <MoveHistory 
                history={this.state.history}
                stepNumber={this.state.stepNumber}
                jumpTo={(move)=> this.jumpTo(move)}
            />
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

function calculateWinningSquares(squares) {
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
                return [a, b, c];
            }
    }
    return [];
}