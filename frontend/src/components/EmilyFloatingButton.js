import React from 'react';
import { useNavigate } from 'react-router-dom';

const EMILY_AVATAR = 'https://static.prod-images.emergentagent.com/jobs/e894c13a-7662-45ac-8c71-306f08d8705f/images/2e9f8b6f1be9800cca71fdf82d4b316c36cf04fed684416b000d4b876305e828.png';

export default function EmilyFloatingButton() {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate('/emily')}
      className="fixed bottom-6 right-6 z-50 group"
      data-testid="emily-floating-btn"
    >
      <div className="relative">
        <div className="w-14 h-14 rounded-full overflow-hidden border-3 border-amber-400 shadow-lg shadow-amber-200/50 group-hover:shadow-xl group-hover:shadow-amber-300/50 transition-all group-hover:scale-105">
          <img src={EMILY_AVATAR} alt="Emily" className="w-full h-full object-cover" />
        </div>
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white" />
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-amber-900 text-white text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          Ask Emily
        </div>
      </div>
    </button>
  );
}
