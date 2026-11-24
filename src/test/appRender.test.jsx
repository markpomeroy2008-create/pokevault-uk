import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { App } from '../App';
import { CollectionProvider } from '../context/CollectionContext';

describe('App component render test', () => {
  it('renders App without crashing', () => {
    expect(() => {
      renderToString(
        <CollectionProvider>
          <App />
        </CollectionProvider>
      );
    }).not.toThrow();
  });
});
