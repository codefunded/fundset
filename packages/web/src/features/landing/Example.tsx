'use client';

import { GlobalCounter } from '../counter/GlobalCounter';
import { PersonalCounter } from '../counter/PersonalCounter';

const Example = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <GlobalCounter />
      <PersonalCounter />
    </div>
  );
};

export default Example;
