import { useState, useEffect, Suspense } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';

// Styled components for the Garage page
const GarageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const GarageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const GarageTitle = styled.h1`
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const GarageActions = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme, variant }) => 
    variant === 'primary' ? theme.colors.evo.primary : 
    variant === 'secondary' ? 'transparent' : theme.colors.accent};
  color: ${({ theme }) => theme.colors.text.primary};
  border: ${({ theme, variant }) => 
    variant === 'secondary' ? `1px solid ${theme.colors.evo.primary}` : 'none'};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-family: ${({ theme }) => theme.fonts.primary};
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background-color: ${({ theme, variant }) => 
      variant === 'primary' ? theme.colors.evo.secondary : 
      variant === 'secondary' ? 'rgba(30, 50, 100, 0.1)' : theme.colors.accent};
    transform: translateY(-2px);
  }
`;

const GarageContent = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const CarViewerCard = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.background.medium};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  overflow: hidden;
  height: 500px;
  position: relative;
`;

const CarCanvas = styled.div`
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, #2a2a2a 0%, #1a1a1a 100%);
`;

const LoadingPlaceholder = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1.2rem;
  background: radial-gradient(circle at center, #2a2a2a 0%, #1a1a1a 100%);
`;

const CarInfoCard = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.background.medium};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 1.5rem;
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  box-shadow: ${({ theme }) => theme.shadows.small};
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const CarTitle = styled.h2`
  font-size: 1.75rem;
  margin: 0;
  color: ${({ theme }) => theme.colors.evo.primary};
  border-bottom: 2px solid ${({ theme }) => theme.colors.evo.primary};
  padding-bottom: 0.75rem;
`;

const CarSpecs = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
`;

const SpecItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  
  .label {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    font-family: ${({ theme }) => theme.fonts.tertiary};
  }
  
  .value {
    font-size: 1.1rem;
    color: ${({ theme }) => theme.colors.text.primary};
    font-weight: 500;
    font-family: ${({ theme }) => theme.fonts.primary};
  }
`;

const ModificationsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const ModificationItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background-color: ${({ theme }) => theme.colors.background.dark};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  
  .mod-name {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.text.primary};
  }
  
  .mod-value {
    font-size: 0.9rem;
    color: ${({ theme }) => theme.colors.accent};
    font-weight: 500;
  }
`;

const SectionTitle = styled.h3`
  font-size: 1.25rem;
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.fonts.primary};
`;

const ColorOptions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const ColorOption = styled.button`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background-color: ${({ color }) => color};
  border: 2px solid ${({ theme, selected }) => 
    selected ? theme.colors.accent : theme.colors.secondary};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    transform: scale(1.1);
  }
`;

// Simple placeholder for the 3D car model
const CarModel = () => {
  return (
    <mesh rotation={[0, Math.PI / 4, 0]}>
      <boxGeometry args={[3, 1, 6]} />
      <meshStandardMaterial color="#CCCCCC" />
    </mesh>
  );
};

// Mock data
const carSpecs = {
  engine: '2.0L Turbocharged I4',
  horsepower: '480 HP',
  torque: '430 lb-ft',
  transmission: '5-Speed Manual',
  drivetrain: 'AWD',
  weight: '3,100 lbs',
  zeroToSixty: '3.5s',
  topSpeed: '165 mph'
};

const carModifications = [
  { name: 'HKS Turbo Kit', value: '+120 HP' },
  { name: 'Coilover Suspension', value: 'Improved Handling' },
  { name: 'Carbon Fiber Hood', value: '-20 lbs' },
  { name: 'Volk TE37 Wheels', value: 'Style & Performance' },
  { name: 'Brembo Brake Kit', value: 'Enhanced Stopping Power' }
];

const carColors = [
  { name: 'Phantom Black', hex: '#111111' },
  { name: 'Rally Red', hex: '#D10000' },
  { name: 'Apex Silver', hex: '#CCCCCC' },
  { name: 'Cosmic Blue', hex: '#1E3264' },
  { name: 'Wicked White', hex: '#FFFFFF' }
];

const Garage = () => {
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState(carColors[2]); // Default to silver
  
  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <GarageContainer>
      <GarageHeader>
        <GarageTitle>The Garage</GarageTitle>
        <GarageActions>
          <Button variant="secondary">
            Save Configuration
          </Button>
          <Button variant="primary">
            Add Modification
          </Button>
        </GarageActions>
      </GarageHeader>
      
      <GarageContent>
        <CarViewerCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {loading ? (
            <LoadingPlaceholder>
              <div className="loading-icon"></div>
            </LoadingPlaceholder>
          ) : (
            <CarCanvas>
              <Canvas>
                <PerspectiveCamera makeDefault position={[0, 2, 10]} />
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} />
                <Suspense fallback={null}>
                  <CarModel />
                  <Environment preset="city" />
                </Suspense>
                <OrbitControls 
                  enablePan={false}
                  minDistance={5}
                  maxDistance={15}
                />
              </Canvas>
            </CarCanvas>
          )}
        </CarViewerCard>
        
        <CarInfoCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <CarTitle>Mitsubishi Lancer Evolution IX</CarTitle>
          
          <div>
            <SectionTitle>Specifications</SectionTitle>
            <CarSpecs>
              {Object.entries(carSpecs).map(([key, value]) => (
                <SpecItem key={key}>
                  <span className="label">{key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}</span>
                  <span className="value">{value}</span>
                </SpecItem>
              ))}
            </CarSpecs>
          </div>
          
          <div>
            <SectionTitle>Color Options</SectionTitle>
            <ColorOptions>
              {carColors.map((color) => (
                <ColorOption 
                  key={color.name}
                  color={color.hex}
                  selected={selectedColor.name === color.name}
                  onClick={() => setSelectedColor(color)}
                  title={color.name}
                />
              ))}
            </ColorOptions>
          </div>
          
          <div>
            <SectionTitle>Modifications</SectionTitle>
            <ModificationsList>
              {carModifications.map((mod, index) => (
                <ModificationItem key={index}>
                  <span className="mod-name">{mod.name}</span>
                  <span className="mod-value">{mod.value}</span>
                </ModificationItem>
              ))}
            </ModificationsList>
          </div>
        </CarInfoCard>
      </GarageContent>
    </GarageContainer>
  );
};

export default Garage;