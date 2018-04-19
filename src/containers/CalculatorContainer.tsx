import * as actions from 'actions';
import NumBtn from 'components/NumBtn';
import PlusBtn from 'components/PlusBtn';
import Result from 'components/Result';
import * as React from 'react';
import { connect } from 'react-redux';
import { State } from 'reducers';
import { bindActionCreators, Dispatch } from 'redux';

class CalculatorContainer extends React.Component<any> {

  public render() {
    const { calculator, calculatorActions } = this.props;

    return (
      <div>
        <div>
          <NumBtn n={1} onClick={() => { calculatorActions.onNumClick(1); }} />
          <NumBtn n={2} onClick={() => { calculatorActions.onNumClick(2); }} />
          <NumBtn n={3} onClick={() => { calculatorActions.onNumClick(3); }} />
        </div>
        <div>
          <NumBtn n={4} onClick={() => { calculatorActions.onNumClick(4); }} />
          <NumBtn n={5} onClick={() => { calculatorActions.onNumClick(5); }} />
          <NumBtn n={6} onClick={() => { calculatorActions.onNumClick(6); }} />
        </div>
        <div>
          <NumBtn n={7} onClick={() => { calculatorActions.onNumClick(7); }} />
          <NumBtn n={8} onClick={() => { calculatorActions.onNumClick(8); }} />
          <NumBtn n={9} onClick={() => { calculatorActions.onNumClick(9); }} />
        </div>
        <div>
          <NumBtn n={0} onClick={() => { calculatorActions.onNumClick(0); }} />
          <PlusBtn onClick={calculatorActions.onPlusClick} >+</PlusBtn>
        </div>
        <div>
          <Result result={calculator.showingResult ? calculator.resultValue : calculator.inputValue} />
        </div>
      </div>
    );
  }
}

const mapState = (state: State) => ({
  calculator: state.calculator,
});

function mapDispatch(dispatch: Dispatch<State>) {
  return {
    calculatorActions: bindActionCreators(actions, dispatch),
  };
}

export default connect(mapState, mapDispatch)(CalculatorContainer as any);
