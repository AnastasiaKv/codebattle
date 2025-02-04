import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import {
  screen, render, fireEvent, waitFor,
} from '@testing-library/react';
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';
import reducers from '../widgets/slices';
import UserSettings from '../widgets/containers/UserSettings';
import UserSettingsForm from '../widgets/components/User/UserSettingsForm';

jest.mock('@fortawesome/react-fontawesome', () => ({
  FontAwesomeIcon: 'img',
}));

jest.mock('axios');

const reducer = combineReducers(reducers);

const preloadedState = {
  userSettings: {
    sound_settings: {
      type: 'standart',
      level: 6,
    },
    id: 11,
    name: 'Diman',
    lang: 'typescript',
    avatar_url: '/assets/images/logo.svg',
    discord_name: null,
    discord_id: null,
    error: '',
  },
};
const store = configureStore({
  reducer,
  preloadedState,
});
jest.mock(
  'gon',
  () => {
    const gonParams = {
      local: 'en',
      current_user: { sound_settings: {} },
      game_id: 10,
    };
    return { getAsset: type => gonParams[type] };
  },
  { virtual: true },
);

const vdom = () => render(
  <Provider store={store}>
    <UserSettings />
  </Provider>,
);
describe('UserSettings test cases', () => {
  it('render main component', () => {
    const { getByText } = vdom();
    expect(getByText(/settings/i)).toBeInTheDocument();
  });
  it('show success notification', async () => {
    const {
      getByRole,
    } = vdom();
    const save = getByRole('button', { name: /save/i });
    const alert = getByRole('alert');
    fireEvent.click(save);

    setTimeout(() => expect(alert).toHaveClass('editSuccess'), 300);
  });
  it('editing profile test', async () => {
    const handleSubmit = jest.fn();
    render(
      <UserSettingsForm
        onSubmit={handleSubmit}
        settings={preloadedState.userSettings}
      />,
    );
    fireEvent.change(screen.getByLabelText(/your name/i), {
      target: { value: 'Dmitry' },
    });
    fireEvent.change(screen.getByTestId('langSelect'), {
      target: { value: 'java' },
    });
    const saveBtn = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveBtn);
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalled();
      expect(handleSubmit).toHaveBeenCalledWith({
        name: 'Dmitry',
        lang: 'java',
        sound_settings: {
          level: 6,
          type: 'standart',
        },
      }, expect.anything());
    });
  });
});
