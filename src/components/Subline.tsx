import styled from 'styled-components';

interface Props {
  sectionTitle?: boolean;
}

// 件名下の年月日、読了時間、カテゴリ
export const Subline = styled.div<Props>`
  font-size: ${(props) => props.theme.fontSize.small};
  color: ${(props) => props.theme.colors.grey.default};
  ${(props) => props.sectionTitle && 'text-align: center;'}
`;
