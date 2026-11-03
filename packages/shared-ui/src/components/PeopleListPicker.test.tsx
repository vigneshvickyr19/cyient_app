import type { PersonResult } from '@cyient/api-client/platform';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { FormPeopleList } from '../form/fields';
import { Form } from '../form/Form';
import { renderWithProviders } from '../test';
import { Button } from './Button';
import { PeopleListPicker } from './PeopleListPicker';
import type { PersonOption } from './PeoplePicker';

const people: PersonResult[] = [
  { id: 2, displayName: 'Meera Member', designation: 'Engineer', department: 'Quality', email: 'meera@example.com' },
  { id: 3, displayName: 'Arjun Analyst', designation: null, department: null, email: 'arjun@example.com' },
  { id: 4, displayName: 'Riya Requester', designation: null, department: null, email: 'riya@example.com' },
];

const routes = { 'GET /api/v1/directory/users': () => people };

async function add(label: RegExp, name: string) {
  await userEvent.type(screen.getByRole('combobox', { name: label }), name.slice(0, 3));
  await userEvent.click(await screen.findByRole('option', { name: new RegExp(name) }));
}

function Team({ max, initial = [] }: { max?: number; initial?: PersonOption[] }) {
  const [team, setTeam] = useState<PersonOption[]>(initial);
  return (
    <PeopleListPicker label="Add a team member" listLabel="Team members" value={team} onChange={setTeam} excludeIds={[4]} max={max} emptyText="No team members yet." />
  );
}

describe('PeopleListPicker', () => {
  it('adds people as chips, leaves out the excluded and the chosen, and removes a person with their chip', async () => {
    renderWithProviders(<Team />, { routes });
    expect(await screen.findByText('No team members yet.')).toBeInTheDocument();

    await add(/Add a team member/, 'Meera Member');
    const list = screen.getByRole('list', { name: 'Team members' });
    expect(within(list).getByText('Meera Member')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Add a team member/ })).toHaveValue('');

    await userEvent.type(screen.getByRole('combobox', { name: /Add a team member/ }), 'ar');
    expect(await screen.findByRole('option', { name: /Arjun Analyst/ })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /Meera Member/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /Riya Requester/ })).not.toBeInTheDocument();
    await userEvent.keyboard('{Escape}');

    await userEvent.click(screen.getByTitle('Remove Meera Member'));
    expect(screen.queryByRole('list', { name: 'Team members' })).not.toBeInTheDocument();
    expect(screen.getByText('No team members yet.')).toBeInTheDocument();
  });

  it('takes nobody more once the list is full', async () => {
    renderWithProviders(<Team max={1} initial={[{ id: 2, name: 'Meera Member' }]} />, { routes });

    expect(await screen.findByRole('combobox', { name: /Add a team member/ })).toBeDisabled();
    expect(screen.getByText('The list is full: at most 1 people.')).toBeInTheDocument();
  });
});

interface InformValues {
  informed: PersonOption[];
}

function InformForm({ onSave, initial = [] }: { onSave: (values: InformValues) => void; initial?: PersonOption[] }) {
  const form = useForm<InformValues>({ defaultValues: { informed: initial } });
  return (
    <Form form={form} onSubmit={onSave}>
      <FormPeopleList<InformValues>
        name="informed"
        label="Add a person"
        listLabel="People to be informed"
        max={2}
        maxMessage="At most 2 people can be informed."
        rules={{ validate: (value: unknown) => (Array.isArray(value) && value.length > 0) || 'Choose someone to inform.' }}
      />
      <Button type="submit">Save</Button>
    </Form>
  );
}

describe('FormPeopleList', () => {
  it("keeps the form's rules, then submits the chosen people", async () => {
    const onSave = vi.fn();
    renderWithProviders(<InformForm onSave={onSave} />, { routes });

    await userEvent.click(await screen.findByRole('button', { name: 'Save' }));
    expect(await screen.findByText('Choose someone to inform.')).toBeInTheDocument();

    await add(/Add a person/, 'Arjun Analyst');
    await userEvent.click(screen.getByRole('button', { name: 'Save' }));

    expect(onSave).toHaveBeenCalledWith({ informed: [{ id: 3, name: 'Arjun Analyst', detail: 'arjun@example.com' }] }, expect.anything());
  });

  it('refuses a list longer than the most allowed', async () => {
    const onSave = vi.fn();
    const three = people.map((person) => ({ id: person.id, name: person.displayName }));
    renderWithProviders(<InformForm onSave={onSave} initial={three} />, { routes });

    await userEvent.click(await screen.findByRole('button', { name: 'Save' }));

    expect(await screen.findByText('At most 2 people can be informed.')).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });
});
