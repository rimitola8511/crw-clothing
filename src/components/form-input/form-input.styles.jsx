import styled, { css } from "styled-components";

const palette = {
  mainColor: "#808080",
  subColor: "#000000",
};

// Equivalente a un mixin de sass
const ShrinkLabel = css`
  top: -14px;
  font-size: 12px;
  color: ${palette.mainColor};
`;

export const Group = styled.div`
  position: relative;
  margin: 45px 0;
`;

export const FormInputLabel = styled.label`
  color: $sub-color;
  font-size: 16px;
  font-weight: normal;
  position: absolute;
  pointer-events: none;
  left: 5px;
  top: 10px;
  transition: 300ms ease all;
  ${(props) => props.shrink && ShrinkLabel}
`;

export const FormInputBox = styled.input`
  letter-spacing: ${({ type }) => type === "password" && "0.3em"};
  background: none;
  background-color: white;
  color: ${palette.subColor};
  font-size: 18px;
  padding: 10px 10px 10px 5px;
  display: block;
  width: 100%;
  border: none;
  border-radius: 0;
  border-bottom: 1px solid ${palette.subColor};
  margin: 25px 0;

  &:focus {
    outline: none;
  }

  &:focus ~ ${FormInputLabel} {
    ${ShrinkLabel};
  }
`;
