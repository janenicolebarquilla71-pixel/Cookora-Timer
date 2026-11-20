import React, { useState } from 'react';
import { Bookmark, ChevronLeft, Clock, Heart, Utensils } from 'lucide-react';
import { Recipe } from '../data/recipes';
import { DishImage } from './DishImage';

interface RecipeDetailViewProps {
  recipe: Recipe;
  isFavorite: boolean;
  onToggleFavorite: (recipeId: string) => void;
  onBack: () => void;
  onCookRecipe: (recipe: Recipe) => void;
}

export function RecipeDetailView({
  recipe,
  isFavorite,
  onToggleFavorite,
  onBack,
  onCookRecipe,
}: RecipeDetailViewProps) {
  const [checkedIngredients, setCheckedIngredients] = useState<Record<number, boolean>>({});

  const toggleIngredient = (idx: number) => {
    setCheckedIngredients((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <article className="flex flex-col min-h-full bg-[#FBF9F5]">
      {/* Hero Dish Photo */}
      <div className="relative h-52 w-full bg-[#F2EADC] shrink-0">
        <DishImage src={recipe.image} alt={recipe.name} className="w-full h-full object-cover" />
        <div className="absolute inset-x-0 top-0 p-3.5 flex items-center justify-between bg-gradient-to-b from-black/45 to-transparent">
          <button
            type="button"
            onClick={onBack}
            className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-full bg-white/85 backdrop-blur-xs text-[#2B3F60] shadow-xs hover:bg-white transition-colors"
            aria-label="Back to recipes"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={() => onToggleFavorite(recipe.id)}
            className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-full bg-white/85 backdrop-blur-xs text-[#2B3F60] shadow-xs hover:bg-white transition-colors"
            aria-label={isFavorite ? 'Remove bookmark' : 'Bookmark recipe'}
          >
            <Bookmark
              className={`w-4 h-4 ${
                isFavorite ? 'fill-[#2B3F60] text-[#2B3F60]' : 'text-[#2B3F60]'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Details Sheet */}
      <div className="px-4 pt-4 pb-5 space-y-4 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-black text-[#2B3F60] tracking-tight">{recipe.name}</h1>
            <div className="mt-1 flex items-center gap-2.5 text-xs font-bold text-[#657289]">
              <span className="inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#2B3F60]" />
                {recipe.timeLabel}
              </span>
              <span aria-hidden="true">|</span>
              <span className="inline-flex items-center gap-1">
                <Utensils className="w-3.5 h-3.5 text-[#2B3F60]" />
                {recipe.category}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onToggleFavorite(recipe.id)}
            className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-full hover:bg-[#EFECE6] transition-colors shrink-0"
            aria-label={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
          >
            <Heart
              className={`w-5 h-5 transition-colors ${
                isFavorite ? 'fill-[#E05353] text-[#E05353]' : 'text-[#2B3F60]'
              }`}
            />
          </button>
        </div>

        {/* Ingredients */}
        <section>
          <h2 className="text-sm font-black text-[#2B3F60] mb-1.5 flex items-center gap-1.5">
            <span aria-hidden="true">🍲</span> Ingredients
          </h2>
          <ul className="space-y-1">
            {recipe.ingredients.map((item, idx) => {
              const checked = Boolean(checkedIngredients[idx]);
              return (
                <li key={item}>
                  <button
                    type="button"
                    onClick={() => toggleIngredient(idx)}
                    className="w-full min-h-[34px] flex items-center gap-2.5 text-left py-0.5 px-1 rounded-lg hover:bg-white/80 transition-colors"
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        checked ? 'bg-[#B9C0CE]' : 'bg-[#2B3F60]'
                      }`}
                    />
                    <span
                      className={`text-xs font-semibold leading-snug ${
                        checked ? 'line-through text-[#929BAE]' : 'text-[#31415C]'
                      }`}
                    >
                      {item}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Instructions */}
        <section>
          <h2 className="text-sm font-black text-[#2B3F60] mb-2 flex items-center gap-1.5">
            <span aria-hidden="true">👩🏻‍🍳</span> Instructions
          </h2>
          <ol className="space-y-2.5">
            {recipe.steps.map((step, idx) => (
              <li key={step} className="flex items-start gap-2.5">
                <span className="text-xs font-black text-[#2B3F60] w-4 shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <p className="text-xs font-semibold text-[#31415C] leading-relaxed">{step}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {/* Pinned Navy Pill CTA matching Screen 4 */}
      <div className="sticky bottom-0 px-4 py-3 bg-gradient-to-t from-[#FBF9F5] via-[#FBF9F5] to-transparent shrink-0">
        <button
          type="button"
          onClick={() => onCookRecipe(recipe)}
          className="w-full min-h-[48px] px-5 py-3 rounded-full bg-[#2B3F60] text-white font-black text-sm inline-flex items-center justify-center gap-2 shadow-md hover:bg-[#385078] active:scale-[0.98] transition-all"
        >
          <span aria-hidden="true">👩🏻‍🍳</span>
          Cook This Recipe
        </button>
      </div>
    </article>
  );
}
