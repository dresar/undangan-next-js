import styled from 'styled-components';

export const PropertyTabs = styled.div`
  display: flex;
  border-bottom: 1px solid #3a3a3a;
  background: #1f1f1f;
`;

export const PropertyTab = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 10px 12px;
  border: none;
  background: ${(props) => (props.$active ? '#ff6b35' : 'transparent')};
  color: #ffffff;
  cursor: pointer;
  font-size: 12px;
  font-weight: ${(props) => (props.$active ? '600' : '400')};
  transition: all 0.2s;
  border-bottom: 2px solid ${(props) => (props.$active ? '#ff6b35' : 'transparent')};

  &:hover {
    background: ${(props) => (props.$active ? '#ff6b35' : '#3a3a3a')};
  }
`;

export const PropertyContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background: #2a2a2a;
`;

export const PropertySection = styled.div`
  margin-bottom: 20px;
`;

export const PropertyLabel = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 500;
  color: #ffffff;
  margin-bottom: 8px;
`;

export const PropertyInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #4a4a4a;
  border-radius: 4px;
  font-size: 12px;
  background: #3a3a3a;
  color: #ffffff;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #ff6b35;
  }

  &::placeholder {
    color: #999999;
  }
`;

export const PropertySelect = styled.select`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #4a4a4a;
  border-radius: 4px;
  font-size: 12px;
  background: #3a3a3a;
  color: #ffffff;
  cursor: pointer;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #ff6b35;
  }
`;

export const PropertyNote = styled.div`
  font-size: 10px;
  color: #999999;
  margin-top: 4px;
  line-height: 1.4;
  font-style: italic;
`;

export const PropertyTextarea = styled.textarea`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #4a4a4a;
  border-radius: 4px;
  font-size: 11px;
  font-family: 'Courier New', monospace;
  background: #3a3a3a;
  color: #ffffff;
  min-height: 120px;
  resize: vertical;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #ff6b35;
  }

  &::placeholder {
    color: #999999;
  }
`;

export const SliderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
`;

export const SliderWrapper = styled.div`
  flex: 1;
  position: relative;
`;

export const SliderTrack = styled.div`
  width: 100%;
  height: 6px;
  background: #4a4a4a;
  border-radius: 3px;
  position: relative;
  cursor: pointer;
`;

export const SliderFill = styled.div<{ $percentage: number }>`
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: ${(props) => props.$percentage}%;
  background: #4a9eff;
  border-radius: 3px;
  transition: width 0.1s;
`;

export const SliderHandle = styled.div<{ $percentage: number }>`
  position: absolute;
  left: ${(props) => props.$percentage}%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  background: #ffffff;
  border: 2px solid #4a9eff;
  border-radius: 2px;
  cursor: grab;
  transition: left 0.1s;

  &:active {
    cursor: grabbing;
  }
`;

export const SliderInput = styled.input`
  width: 60px;
  padding: 6px 8px;
  border: 1px solid #4a4a4a;
  border-radius: 4px;
  font-size: 12px;
  background: #3a3a3a;
  color: #ffffff;
  text-align: center;

  &:focus {
    outline: none;
    border-color: #ff6b35;
  }
`;

export const ShapeSelector = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-top: 8px;
`;

export const ShapeButton = styled.button<{ $active: boolean }>`
  padding: 12px;
  border: 2px solid ${(props) => (props.$active ? '#ff6b35' : '#4a4a4a')};
  border-radius: 4px;
  background: ${(props) => (props.$active ? '#ff6b3520' : '#3a3a3a')};
  color: #ffffff;
  cursor: pointer;
  font-size: 20px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    border-color: ${(props) => (props.$active ? '#ff6b35' : '#6a6a6a')};
    background: ${(props) => (props.$active ? '#ff6b3520' : '#4a4a4a')};
  }
`;

