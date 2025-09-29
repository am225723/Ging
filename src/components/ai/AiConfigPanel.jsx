import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { AI_PROVIDERS } from '../../services/aiProviderFactory';

const ConfigPanelContainer = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.background.medium};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: ${({ theme }) => theme.shadows.medium};
`;

const ConfigTitle = styled.h3`
  font-size: 1.25rem;
  margin: 0 0 1rem 0;
  color: ${({ theme }) => theme.colors.accent};
  font-family: ${({ theme }) => theme.fonts.primary};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  .config-icon {
    font-size: 1rem;
  }
`;

const ConfigDescription = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 1.5rem;
  line-height: 1.5;
`;

const ConfigForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ConfigSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const SectionTitle = styled.h4`
  font-size: 1rem;
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.fonts.primary};
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Select = styled.select`
  padding: 0.75rem;
  background-color: ${({ theme }) => theme.colors.background.dark};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.fonts.tertiary};
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

const Input = styled.input`
  padding: 0.75rem;
  background-color: ${({ theme }) => theme.colors.background.dark};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.fonts.tertiary};
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

const Slider = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  .slider-container {
    display: flex;
    align-items: center;
    gap: 1rem;
    
    .slider {
      flex: 1;
      -webkit-appearance: none;
      height: 6px;
      border-radius: 3px;
      background: linear-gradient(to right, 
        ${({ theme }) => theme.colors.background.dark}, 
        ${({ theme }) => theme.colors.accent}
      );
      outline: none;
      
      &::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: ${({ theme }) => theme.colors.text.primary};
        cursor: pointer;
        border: 2px solid ${({ theme }) => theme.colors.accent};
      }
    }
    
    .slider-value {
      width: 40px;
      text-align: center;
      font-weight: 600;
      color: ${({ theme }) => theme.colors.text.primary};
    }
  }
  
  .slider-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.text.muted};
  }
`;

const Checkbox = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  input {
    width: 18px;
    height: 18px;
    cursor: pointer;
  }
  
  label {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.text.primary};
    cursor: pointer;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background-color: ${({ theme, variant }) => 
    variant === 'primary' ? theme.colors.accent : 'transparent'};
  color: ${({ theme, variant }) => 
    variant === 'primary' ? theme.colors.background.dark : theme.colors.text.secondary};
  border: 1px solid ${({ theme, variant }) => 
    variant === 'primary' ? theme.colors.accent : theme.colors.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-family: ${({ theme }) => theme.fonts.tertiary};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background-color: ${({ theme, variant }) => 
      variant === 'primary' ? theme.colors.accent : 'rgba(199, 167, 88, 0.1)'};
    color: ${({ theme, variant }) => 
      variant === 'primary' ? theme.colors.background.dark : theme.colors.accent};
  }
`;

/**
 * AI Configuration Panel Component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.initialConfig - Initial AI configuration
 * @param {Function} props.onConfigChange - Callback when configuration changes
 * @param {boolean} props.isOpen - Whether the panel is open
 * @param {Function} props.onClose - Callback when panel is closed
 */
const AiConfigPanel = ({ 
  initialConfig = {}, 
  onConfigChange,
  isOpen = true,
  onClose
}) => {
  // Default configuration
  const defaultConfig = {
    provider: AI_PROVIDERS.GEMINI,
    model: 'gemini-1.5-flash',
    temperature: 0.7,
    maxTokens: 1024,
    detailLevel: 3,
    cacheEnabled: true,
  };
  
  // Merge initial config with defaults
  const [config, setConfig] = useState({ ...defaultConfig, ...initialConfig });
  
  // Update config when initialConfig changes
  useEffect(() => {
    setConfig({ ...defaultConfig, ...initialConfig });
  }, [initialConfig]);
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (onConfigChange) {
      onConfigChange(config);
    }
    if (onClose) {
      onClose();
    }
  };
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : 
              type === 'number' ? parseFloat(value) :
              value
    }));
  };
  
  if (!isOpen) return null;
  
  return (
    <ConfigPanelContainer
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <ConfigTitle>
        <span className="config-icon">⚙️</span>
        AI Configuration
      </ConfigTitle>
      
      <ConfigDescription>
        Customize how the AI generates content for you. These settings will affect all AI-powered features.
      </ConfigDescription>
      
      <ConfigForm onSubmit={handleSubmit}>
        <ConfigSection>
          <SectionTitle>AI Provider</SectionTitle>
          
          <FormGroup>
            <Label htmlFor="provider">Provider</Label>
            <Select 
              id="provider" 
              name="provider" 
              value={config.provider}
              onChange={handleChange}
            >
              <option value={AI_PROVIDERS.GEMINI}>Google Gemini</option>
              <option value={AI_PROVIDERS.OPENAI} disabled>OpenAI (Coming Soon)</option>
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="model">Model</Label>
            <Select 
              id="model" 
              name="model" 
              value={config.model}
              onChange={handleChange}
            >
              {config.provider === AI_PROVIDERS.GEMINI && (
                <>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fast)</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro (Powerful)</option>
                </>
              )}
            </Select>
          </FormGroup>
        </ConfigSection>
        
        <ConfigSection>
          <SectionTitle>Generation Settings</SectionTitle>
          
          <FormGroup>
            <Label htmlFor="temperature">Creativity (Temperature)</Label>
            <Slider>
              <div className="slider-container">
                <input 
                  type="range" 
                  className="slider" 
                  id="temperature" 
                  name="temperature"
                  min="0.1" 
                  max="1.0" 
                  step="0.1" 
                  value={config.temperature}
                  onChange={handleChange}
                />
                <div className="slider-value">{config.temperature}</div>
              </div>
              <div className="slider-labels">
                <span>Precise</span>
                <span>Creative</span>
              </div>
            </Slider>
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="detailLevel">Detail Level</Label>
            <Slider>
              <div className="slider-container">
                <input 
                  type="range" 
                  className="slider" 
                  id="detailLevel" 
                  name="detailLevel"
                  min="1" 
                  max="5" 
                  step="1" 
                  value={config.detailLevel}
                  onChange={handleChange}
                />
                <div className="slider-value">{config.detailLevel}</div>
              </div>
              <div className="slider-labels">
                <span>Brief</span>
                <span>Detailed</span>
              </div>
            </Slider>
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="maxTokens">Response Length (Max Tokens)</Label>
            <Select 
              id="maxTokens" 
              name="maxTokens" 
              value={config.maxTokens}
              onChange={handleChange}
            >
              <option value="512">Short</option>
              <option value="1024">Medium</option>
              <option value="2048">Long</option>
              <option value="4096">Very Long</option>
            </Select>
          </FormGroup>
        </ConfigSection>
        
        <ConfigSection>
          <SectionTitle>Advanced Settings</SectionTitle>
          
          <Checkbox>
            <input 
              type="checkbox" 
              id="cacheEnabled" 
              name="cacheEnabled"
              checked={config.cacheEnabled}
              onChange={handleChange}
            />
            <label htmlFor="cacheEnabled">Enable response caching (saves API calls)</label>
          </Checkbox>
        </ConfigSection>
        
        <ButtonGroup>
          <Button type="button" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="primary">Save Configuration</Button>
        </ButtonGroup>
      </ConfigForm>
    </ConfigPanelContainer>
  );
};

export default AiConfigPanel;