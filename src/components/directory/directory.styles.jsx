import styled from "styled-components";

export const DirectoryContainer = styled.div`
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  flex-direction: column;
  @media (min-width: 1025px) {
    flex-direction: row;
  }
`;
