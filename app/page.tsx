import React from 'react';
import RecipeGenerator from '@components/recipeGenerator';  // Adjust the path based on your project structure

const Page: React.FC = () => {
  return (
    <div>
      <RecipeGenerator /> {/* Calling the RecipeGenerator component here */}
    </div>
  );
};

export default Page;
