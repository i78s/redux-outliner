import * as React from 'react';
import styled from 'styled-components';

interface OuterProps {
  initialValue: string;
  inputRef: (e: any) => void;
  onInput: (e: any) => void;
  onKeyDown: (e: any) => void;
  onKeyUp: (e: any) => void;
}

interface State {
  value: string;
  isComposing: boolean;
}

export default class Input extends React.PureComponent<OuterProps, State> {
  constructor(props: any) {
    super(props);
    this.state = {
      value: props.initialValue,
      isComposing: false,
    };

    this.handleInput = this.handleInput.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleKeyUp = this.handleKeyUp.bind(this);
    this.handlePaste = this.handlePaste.bind(this);
  }

  public handleInput(e: any) {
    const { onInput } = this.props;
    if (this.state.isComposing) {
      return;
    }
    onInput(e);
  }

  public handleKeyDown(e: any) {
    const { onKeyDown } = this.props;
    this.setState({
      ...this.state,
      isComposing: e.keyCode === 229,
    });
    onKeyDown(e);
  }

  public handleKeyUp(e: any) {
    const { onKeyUp } = this.props;
    if (this.state.isComposing && e.keyCode === 13) {
      onKeyUp(e);
    }
  }

  public handlePaste(e: any) {
    e.preventDefault();
    const value: string = e.clipboardData.getData('text/plain');
    document.execCommand('insertHTML', false, value);
  }

  public render() {
    const { value } = this.state;
    return (
      <StyledInput
        suppressContentEditableWarning={true}
        contentEditable={true}
        ref={this.props.inputRef}
        onInput={this.handleInput}
        onKeyDown={this.handleKeyDown}
        onKeyUp={this.handleKeyUp}
        onPaste={this.handlePaste}
      >
        {value}
      </StyledInput>
    );
  }
}

const StyledInput = styled.div`
  margin-bottom: 8px;
  padding-left: 18px;
  outline: none;
  line-height: 22px;
`;
