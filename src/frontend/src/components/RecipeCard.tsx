import { useNavigate } from 'react-router-dom';
import type { Recipe } from '../types/types';
import { cardBase, cardHighlight } from '../styles/styles';

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard = ({ recipe }: RecipeCardProps) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() =>
        void navigate(`/recipe/${recipe.id}`, { state: { recipe } })
      }
      className={`${cardBase} ${cardHighlight} flex w-full flex-col`}
    >
      {/* Recipe Image */}
      <img
        src={`/assets/${recipe.id}.jpg`}
        alt={recipe.title}
        className="h-40 w-full rounded object-cover"
      />

      {/* Recipe Information Panel */}
      <div className="flex flex-1 flex-col p-3">
        {/* Recipe name */}
        <h2 className="mb-3 truncate text-xl font-semibold">{recipe.title}</h2>

        {/* Bottom Row */}
        <div className="mt-auto flex items-center justify-between">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            className="mr-2 h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{recipe.prep_time_min + recipe.cook_time_min}</span>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
