'use client';

import { GlobalCounter } from '../counter/GlobalCounter';
import { PersonalCounter } from '../counter/PersonalCounter';
import { IncrementHistory } from '../counter/IncrementHistory';

const Example = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <GlobalCounter />
      <PersonalCounter />
      <IncrementHistory />
    </div>
  );
};

export default Example;
