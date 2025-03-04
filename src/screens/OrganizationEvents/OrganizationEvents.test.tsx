import React from 'react';
import { MockedProvider } from '@apollo/react-testing';
import { act, render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import 'jest-location-mock';
import { I18nextProvider } from 'react-i18next';

import OrganizationEvents from './OrganizationEvents';
import { ORGANIZATION_EVENT_LIST } from 'GraphQl/Queries/Queries';
import { store } from 'state/store';
import { CREATE_EVENT_MUTATION } from 'GraphQl/Mutations/mutations';
import i18nForTest from 'utils/i18nForTest';

const MOCKS = [
  {
    request: {
      query: ORGANIZATION_EVENT_LIST,
    },
    result: {
      data: {
        eventsByOrganization: [
          {
            _id: 1,
            title: 'Event',
            description: 'Event Test',
            startDate: '',
            endDate: '',
            location: 'New Delhi',
            startTime: '02:00',
            endTime: '06:00',
            allDay: false,
            recurring: false,
            isPublic: true,
            isRegisterable: true,
          },
        ],
      },
    },
  },
  {
    request: {
      query: CREATE_EVENT_MUTATION,
      variables: {
        title: 'Dummy Org',
        description: 'This is a dummy organization',
        isPublic: false,
        recurring: true,
        isRegisterable: true,
        organizationId: undefined,
        startDate: 'Thu Mar 28 20222',
        endDate: 'Fri Mar 28 20223',
        allDay: true,
      },
    },
    result: {
      data: {
        createEvent: {
          _id: '1',
        },
      },
    },
  },
];

async function wait(ms = 0) {
  await act(() => {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  });
}

describe('Organisation Events Page', () => {
  const searchData = {
    byTitle: 'Dummy title',
    byDescription: 'This is a dummy description',
  };

  const formData = {
    title: 'Dummy Org',
    description: 'This is a dummy organization',
    startDate: '03/28/2022',
    endDate: '04/15/2023',
    location: 'New Delhi',
    startTime: '02:00',
    endTime: '06:00',
  };

  global.alert = jest.fn();

  test('It is necessary to query the correct mock data.', async () => {
    const dataQuery1 = MOCKS[0]?.result?.data?.eventsByOrganization;

    expect(dataQuery1).toEqual([
      {
        _id: 1,
        title: 'Event',
        description: 'Event Test',
        startDate: '',
        endDate: '',
        location: 'New Delhi',
        startTime: '02:00',
        endTime: '06:00',
        allDay: false,
        recurring: false,
        isPublic: true,
        isRegisterable: true,
      },
    ]);
  });

  test('It is necessary to check correct render', async () => {
    window.location.assign('/orglist');

    const { container } = render(
      <MockedProvider addTypename={false} mocks={MOCKS}>
        <BrowserRouter>
          <Provider store={store}>
            <I18nextProvider i18n={i18nForTest}>
              <OrganizationEvents />
            </I18nextProvider>
          </Provider>
        </BrowserRouter>
      </MockedProvider>
    );

    expect(container.textContent).not.toBe('Loading data...');
    await wait();
    expect(container.textContent).toMatch('Events');
    expect(container.textContent).toMatch('Filter by Title');
    expect(container.textContent).toMatch('Filter by Description');
    expect(container.textContent).toMatch('Events');
    expect(window.location).toBeAt('/orglist');
  });

  test('No mock data', async () => {
    render(
      <MockedProvider>
        <BrowserRouter>
          <Provider store={store}>
            <I18nextProvider i18n={i18nForTest}>
              <OrganizationEvents />
            </I18nextProvider>
          </Provider>
        </BrowserRouter>
      </MockedProvider>
    );

    await wait();
  });

  test('Testing filter functionality', async () => {
    render(
      <MockedProvider addTypename={false} mocks={MOCKS}>
        <BrowserRouter>
          <Provider store={store}>
            <I18nextProvider i18n={i18nForTest}>
              <OrganizationEvents />
            </I18nextProvider>
          </Provider>
        </BrowserRouter>
      </MockedProvider>
    );

    await wait();

    userEvent.type(screen.getByTestId('serachByTitle'), searchData.byTitle);
    userEvent.type(
      screen.getByTestId('serachByDescription'),
      searchData.byDescription
    );

    expect(screen.getByTestId('serachByTitle')).toHaveValue(searchData.byTitle);
    expect(screen.getByTestId('serachByDescription')).toHaveValue(
      searchData.byDescription
    );
  });

  test('Testing toggling of Create event modal', async () => {
    render(
      <MockedProvider addTypename={false} mocks={MOCKS}>
        <BrowserRouter>
          <Provider store={store}>
            <I18nextProvider i18n={i18nForTest}>
              <OrganizationEvents />
            </I18nextProvider>
          </Provider>
        </BrowserRouter>
      </MockedProvider>
    );

    await wait();

    userEvent.click(screen.getByTestId('createEventModalBtn'));

    userEvent.click(screen.getByTestId('createEventModalCloseBtn'));
  });

  test('Testing Create event modal', async () => {
    render(
      <MockedProvider addTypename={false} mocks={MOCKS}>
        <BrowserRouter>
          <Provider store={store}>
            <I18nextProvider i18n={i18nForTest}>
              <OrganizationEvents />
            </I18nextProvider>
          </Provider>
        </BrowserRouter>
      </MockedProvider>
    );

    await wait();

    userEvent.click(screen.getByTestId('createEventModalBtn'));

    userEvent.type(screen.getByPlaceholderText(/Enter Title/i), formData.title);
    userEvent.type(
      screen.getByPlaceholderText(/Enter Description/i),
      formData.description
    );
    userEvent.type(
      screen.getByPlaceholderText(/Enter Location/i),
      formData.location
    );
    userEvent.type(
      screen.getByPlaceholderText(/Enter Location/i),
      formData.location
    );
    await act(async () => {
      userEvent.type(
        screen.getByPlaceholderText(/Start Date/i),
        formData.startDate
      );
      userEvent.type(
        screen.getByPlaceholderText(/End Date/i),
        formData.endDate
      );
    });
    userEvent.click(screen.getByTestId('alldayCheck'));
    userEvent.click(screen.getByTestId('recurringCheck'));
    userEvent.click(screen.getByTestId('ispublicCheck'));
    userEvent.click(screen.getByTestId('registrableCheck'));

    await wait();

    expect(screen.getByPlaceholderText(/Enter Title/i)).toHaveValue(
      formData.title
    );
    expect(screen.getByPlaceholderText(/Enter Description/i)).toHaveValue(
      formData.description
    );

    expect(screen.getByTestId('alldayCheck')).not.toBeChecked();
    expect(screen.getByTestId('recurringCheck')).toBeChecked();
    expect(screen.getByTestId('ispublicCheck')).not.toBeChecked();
    expect(screen.getByTestId('registrableCheck')).toBeChecked();

    userEvent.click(screen.getByTestId('createEventBtn'));
  });

  test('Testing if the event is not for all day', async () => {
    render(
      <MockedProvider addTypename={false} mocks={MOCKS}>
        <BrowserRouter>
          <Provider store={store}>
            <I18nextProvider i18n={i18nForTest}>
              <OrganizationEvents />
            </I18nextProvider>
          </Provider>
        </BrowserRouter>
      </MockedProvider>
    );

    await wait();

    userEvent.click(screen.getByTestId('createEventModalBtn'));
    userEvent.type(screen.getByPlaceholderText(/Enter Title/i), formData.title);
    userEvent.type(
      screen.getByPlaceholderText(/Enter Description/i),
      formData.description
    );
    userEvent.type(
      screen.getByPlaceholderText(/Enter Location/i),
      formData.location
    );
    userEvent.click(screen.getByTestId('alldayCheck'));
    await wait();

    userEvent.type(
      screen.getByPlaceholderText(/Start Time/i),
      formData.startTime
    );
    userEvent.type(screen.getByPlaceholderText(/End Time/i), formData.endTime);

    userEvent.click(screen.getByTestId('createEventBtn'));
  });
});
