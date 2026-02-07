---
name: Mantine Form
description: Form management with @mantine/form
---

# Mantine Form (`useForm`)

`@mantine/form` is a powerful hook for managing complex form states, validation, and submission.

## Basic Usage

Mantine 8 defaults to `mode: 'uncontrolled'` for better performance.

```tsx
import { useForm } from '@mantine/form';

const form = useForm({
  mode: 'uncontrolled', // recommended
  initialValues: {
    email: '',
    age: 0,
    terms: false,
  },

  validate: {
    email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    age: (value) => (value < 18 ? 'Must be at least 18' : null),
  },
});

return (
  <form onSubmit={form.onSubmit((values) => console.log(values))}>
    <TextInput
      label="Email"
      {...form.getInputProps('email')}
      key={form.key('email')} // Required for uncontrolled mode
    />
    <NumberInput
      label="Age"
      {...form.getInputProps('age')}
      key={form.key('age')}
    />
    <Checkbox
      label="Terms"
      {...form.getInputProps('terms', { type: 'checkbox' })}
      key={form.key('terms')}
    />
    <Button type="submit">Submit</Button>
  </form>
);
```

## Advanced Features

### Nested Fields

```tsx
const form = useForm({
  initialValues: {
    user: { firstName: '', lastName: '' }
  }
});

<TextInput {...form.getInputProps('user.firstName')} />
```

### List Items (Arrays)

```tsx
form.insertListItem('employees', { name: '', active: true });
form.removeListItem('employees', index);
form.reorderListItem('employees', { from: 1, to: 0 });
```

### Manual Validation & Errors

```tsx
form.validate(); // validates all fields
form.validateField('email');

form.setFieldError('email', 'Email already taken');
form.setErrors({ email: 'Error', age: 'Too young' });

form.reset(); // resets to initialValues
```

### Status & Dirty/Touched

- `form.isDirty()`: Check if any part of the form has changed.
- `form.isTouched('field')`: Check if a field has been blurred.
- `form.isValid()`: Check if form validation passes without setting errors.

<!--
Source references:
- https://mantine.dev/form/use-form/
- https://mantine.dev/form/validation/
- https://mantine.dev/form/nested/
- https://mantine.dev/form/values/
-->
