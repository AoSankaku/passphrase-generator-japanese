import styled from "styled-components";

export default function Footer() {
  return (
    <FooterRoot>
      <p>Copyright © 2025 Blue Triangle</p>
      <p>
        Made with{" "}
        <a href="https://vitejs.dev" target="_blank" rel="noopener noreferrer">
          Vite
        </a>{" "}
        +{" "}
        <a href="https://react.dev" target="_blank" rel="noopener noreferrer">
          React
        </a>{" "}
        and ♥
      </p>
    </FooterRoot>
  );
}

const FooterRoot = styled.footer`
  width: 100%;
  text-align: center;
  font-size: 12px;
  line-height: 2.1;
  margin-top: 150px;
  padding-bottom: 100px;
  opacity: 0.6;

  a {
    color: inherit;
    text-decoration: underline;
    text-underline-offset: 2px;
  }

  p {
    margin: 0;
  }
`;
