import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

// Styled components for the Characters page
const CharactersContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const CharactersHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const CharactersTitle = styled.h1`
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const CharactersActions = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled(motion.button)`
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme, variant }) => 
    variant === 'primary' ? theme.colors.primary : 
    variant === 'secondary' ? 'transparent' : theme.colors.accent};
  color: ${({ theme }) => theme.colors.text.primary};
  border: ${({ theme, variant }) => 
    variant === 'secondary' ? `1px solid ${theme.colors.accent}` : 'none'};
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
      variant === 'primary' ? theme.colors.primary : 
      variant === 'secondary' ? 'rgba(199, 167, 88, 0.1)' : theme.colors.accent};
    transform: translateY(-2px);
  }
`;

const SearchBar = styled.div`
  display: flex;
  margin-bottom: 2rem;
  
  input {
    flex: 1;
    padding: 0.75rem 1rem;
    background-color: ${({ theme }) => theme.colors.background.dark};
    border: 1px solid ${({ theme }) => theme.colors.secondary};
    border-radius: ${({ theme }) => theme.borderRadius.small};
    color: ${({ theme }) => theme.colors.text.primary};
    font-family: ${({ theme }) => theme.fonts.tertiary};
    font-size: 1rem;
    
    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.accent};
    }
    
    &::placeholder {
      color: ${({ theme }) => theme.colors.text.muted};
    }
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: ${({ theme, active }) => 
    active ? theme.colors.accent : 'transparent'};
  color: ${({ theme, active }) => 
    active ? theme.colors.background.dark : theme.colors.text.secondary};
  border: 1px solid ${({ theme, active }) => 
    active ? theme.colors.accent : theme.colors.secondary};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-family: ${({ theme }) => theme.fonts.tertiary};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background-color: ${({ theme, active }) => 
      active ? theme.colors.accent : 'rgba(199, 167, 88, 0.1)'};
    color: ${({ theme, active }) => 
      active ? theme.colors.background.dark : theme.colors.accent};
  }
`;

const CharactersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
`;

const CharacterCard = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.background.medium};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  transition: all ${({ theme }) => theme.transitions.medium};
  cursor: pointer;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme.shadows.large};
    border-color: ${({ theme }) => theme.colors.accent};
    
    .character-image {
      transform: scale(1.05);
    }
  }
`;

const CharacterImageContainer = styled.div`
  height: 200px;
  overflow: hidden;
  position: relative;
  background-color: ${({ theme }) => theme.colors.background.dark};
  
  .character-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform ${({ theme }) => theme.transitions.medium};
  }
  
  .character-game {
    position: absolute;
    top: 0.75rem;
    right: 0.75rem;
    padding: 0.25rem 0.75rem;
    background-color: rgba(0, 0, 0, 0.7);
    color: ${({ theme }) => theme.colors.accent};
    font-size: 0.8rem;
    border-radius: ${({ theme }) => theme.borderRadius.small};
    font-family: ${({ theme }) => theme.fonts.tertiary};
  }
`;

const CharacterInfo = styled.div`
  padding: 1.5rem;
`;

const CharacterName = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.text.primary};
  font-family: ${({ theme }) => theme.fonts.primary};
`;

const CharacterDescription = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.5;
`;

const CharacterStats = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.secondary};
`;

const CharacterStat = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .stat-value {
    font-size: 1.1rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.accent};
    font-family: ${({ theme }) => theme.fonts.primary};
  }
  
  .stat-label {
    font-size: 0.8rem;
    color: ${({ theme }) => theme.colors.text.muted};
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-family: ${({ theme }) => theme.fonts.tertiary};
  }
`;

const LoadMoreButton = styled(Button)`
  margin: 2rem auto 0;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  
  h3 {
    margin-bottom: 1rem;
    color: ${({ theme }) => theme.colors.text.primary};
  }
  
  p {
    color: ${({ theme }) => theme.colors.text.secondary};
    max-width: 500px;
    margin-bottom: 2rem;
  }
`;

// Mock data for FromSoft characters
const mockCharacters = [
  {
    id: 1,
    name: 'Solaire of Astora',
    game: 'Dark Souls',
    description: 'A Warrior of Sunlight who is grossly incandescent. Known for his jolly cooperation and praising the sun.',
    stats: {
      strength: 85,
      intelligence: 60,
      faith: 95
    },
    image: '/assets/images/characters/solaire.png'
  },
  {
    id: 2,
    name: 'Lady Maria',
    game: 'Bloodborne',
    description: 'A hunter from the Healing Church workshop who uses the Rakuyo, a trick weapon that splits into dual blades.',
    stats: {
      strength: 75,
      skill: 95,
      bloodtinge: 80
    },
    image: '/assets/images/characters/lady_maria.png'
  },
  {
    id: 3,
    name: 'Siegward of Catarina',
    game: 'Dark Souls 3',
    description: 'A jolly Catarina knight who fulfills his promise to his old friend Yhorm the Giant.',
    stats: {
      strength: 90,
      vitality: 85,
      friendship: 100
    },
    image: '/assets/images/characters/siegward.png'
  },
  {
    id: 4,
    name: 'Malenia, Blade of Miquella',
    game: 'Elden Ring',
    description: 'The undefeated swordswoman who fought Radahn to a standstill. Known as the most difficult boss in the game.',
    stats: {
      dexterity: 100,
      scarlet_rot: 95,
      difficulty: 100
    },
    image: '/assets/images/characters/malenia.png'
  },
  {
    id: 5,
    name: 'Eileen the Crow',
    game: 'Bloodborne',
    description: 'A Hunter of Hunters who eliminates hunters who have been corrupted by blood and gone mad.',
    stats: {
      skill: 90,
      stealth: 95,
      wisdom: 85
    },
    image: '/assets/images/characters/eileen.png'
  },
  {
    id: 6,
    name: 'Artorias the Abysswalker',
    game: 'Dark Souls',
    description: 'One of Gwyn\'s four knights who sacrificed himself to save his wolf companion, Sif.',
    stats: {
      strength: 95,
      resolve: 100,
      tragedy: 90
    },
    image: '/assets/images/characters/artorias.png'
  },
  {
    id: 7,
    name: 'Ranni the Witch',
    game: 'Elden Ring',
    description: 'The daughter of Radagon and Rennala who orchestrated the Night of the Black Knives.',
    stats: {
      intelligence: 100,
      magic: 95,
      ambition: 90
    },
    image: '/assets/images/characters/ranni.png'
  },
  {
    id: 8,
    name: 'Gehrman, the First Hunter',
    game: 'Bloodborne',
    description: 'The first hunter and creator of the Hunter\'s Workshop, who guides and mentors new hunters.',
    stats: {
      skill: 95,
      experience: 100,
      sorrow: 90
    },
    image: '/assets/images/characters/gehrman.png'
  }
];

const games = ['All Games', 'Dark Souls', 'Dark Souls 2', 'Dark Souls 3', 'Bloodborne', 'Sekiro', 'Elden Ring'];

const Characters = () => {
  const [loading, setLoading] = useState(true);
  const [characters, setCharacters] = useState([]);
  const [filteredCharacters, setFilteredCharacters] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState('All Games');
  const [visibleCount, setVisibleCount] = useState(4);
  
  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setCharacters(mockCharacters);
      setFilteredCharacters(mockCharacters);
      setLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    // Filter characters based on search query and selected game
    let filtered = [...characters];
    
    if (searchQuery) {
      filtered = filtered.filter(char => 
        char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        char.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    if (selectedGame !== 'All Games') {
      filtered = filtered.filter(char => char.game === selectedGame);
    }
    
    setFilteredCharacters(filtered);
  }, [searchQuery, selectedGame, characters]);
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleGameFilter = (game) => {
    setSelectedGame(game);
  };
  
  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + 4, filteredCharacters.length));
  };
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-icon"></div>
      </div>
    );
  }
  
  return (
    <CharactersContainer>
      <CharactersHeader>
        <CharactersTitle>FromSoft Characters</CharactersTitle>
        <CharactersActions>
          <Button variant="primary">
            Add Character
          </Button>
        </CharactersActions>
      </CharactersHeader>
      
      <SearchBar>
        <input 
          type="text" 
          placeholder="Search characters..." 
          value={searchQuery}
          onChange={handleSearchChange}
        />
      </SearchBar>
      
      <FilterBar>
        {games.map(game => (
          <FilterButton 
            key={game}
            active={selectedGame === game}
            onClick={() => handleGameFilter(game)}
          >
            {game}
          </FilterButton>
        ))}
      </FilterBar>
      
      {filteredCharacters.length > 0 ? (
        <>
          <CharactersGrid>
            {filteredCharacters.slice(0, visibleCount).map((character, index) => (
              <CharacterCard
                key={character.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <CharacterImageContainer>
                  <div className="character-image">
                    <div style={{ padding: '10px', textAlign: 'center', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {character.name} Image
                    </div>
                  </div>
                  <div className="character-game">{character.game}</div>
                </CharacterImageContainer>
                
                <CharacterInfo>
                  <CharacterName>{character.name}</CharacterName>
                  <CharacterDescription>{character.description}</CharacterDescription>
                  
                  <CharacterStats>
                    {Object.entries(character.stats).slice(0, 3).map(([stat, value]) => (
                      <CharacterStat key={stat}>
                        <span className="stat-value">{value}</span>
                        <span className="stat-label">{stat.replace('_', ' ')}</span>
                      </CharacterStat>
                    ))}
                  </CharacterStats>
                </CharacterInfo>
              </CharacterCard>
            ))}
          </CharactersGrid>
          
          {visibleCount < filteredCharacters.length && (
            <LoadMoreButton 
              variant="secondary"
              onClick={handleLoadMore}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Load More
            </LoadMoreButton>
          )}
        </>
      ) : (
        <EmptyState>
          <h3>No characters found</h3>
          <p>
            Try adjusting your search or filter criteria to find the FromSoft character you're looking for.
          </p>
          <Button 
            variant="secondary"
            onClick={() => {
              setSearchQuery('');
              setSelectedGame('All Games');
            }}
          >
            Reset Filters
          </Button>
        </EmptyState>
      )}
    </CharactersContainer>
  );
};

export default Characters;