import type { Meta, StoryObj } from '@storybook/react'
import LightEditor from './LightEditor'

const meta: Meta<typeof LightEditor> = {
    title: 'Components/LightEditor',
    component: LightEditor,
    parameters: {
        layout: 'padded',
    },
    tags: ['autodocs'],
    argTypes: {
        value: {
            control: 'text',
            description: 'The code content',
        },
        readOnly: {
            control: 'boolean',
            description: 'Whether the editor is read-only',
        },
        height: {
            control: 'text',
            description: 'Editor height (CSS value)',
        },
    },
}

export default meta
type Story = StoryObj<typeof LightEditor>

// Default empty editor
export const Empty: Story = {
    args: {
        value: '',
        height: '200px',
    },
}

// Editor with Hello World code
export const HelloWorld: Story = {
    args: {
        value: `# Hello World in Python
print("Hello, World!")`,
        height: '150px',
    },
}

// Editor with longer Python code
export const PythonFunction: Story = {
    args: {
        value: `def greet(name):
    """Greet someone by name."""
    if name:
        return f"Hello, {name}!"
    else:
        return "Hello, stranger!"

# Test the function
message = greet("Alice")
print(message)`,
        height: '300px',
    },
}

// Read-only editor
export const ReadOnly: Story = {
    args: {
        value: `# This editor is read-only
x = 42
print(x)`,
        readOnly: true,
        height: '150px',
    },
}

// Editor with many lines (for testing cursor alignment)
export const ManyLines: Story = {
    args: {
        value: `# Line 1
# Line 2
# Line 3
# Line 4
# Line 5
# Line 6
# Line 7
# Line 8
# Line 9
# Line 10
# Line 11
# Line 12
# Line 13
# Line 14
# Line 15`,
        height: '400px',
    },
    parameters: {
        docs: {
            description: {
                story: 'Test cursor alignment on multiple lines - cursor should stay aligned without drift.',
            },
        },
    },
}

// Editor with long lines
export const LongLines: Story = {
    args: {
        value: `message = "This is a very long line that tests horizontal cursor positioning and wrapping behavior"
short = "x"
another_long_line = "Testing horizontal alignment: abcdefghijklmnopqrstuvwxyz0123456789"`,
        height: '150px',
    },
}

// Editor with syntax highlighting showcase
export const SyntaxShowcase: Story = {
    args: {
        value: `# Comments are italic and muted
def function_name(param):
    """Docstrings are strings"""
    keyword = True  # Keywords are highlighted
    number = 42  # Numbers are highlighted
    string = "hello"  # Strings are highlighted
    return param + number

# Operators and punctuation
result = function_name(10) + 5 * 2`,
        height: '300px',
    },
    parameters: {
        docs: {
            description: {
                story: 'Showcases all syntax highlighting token types: keywords, functions, strings, numbers, comments, operators.',
            },
        },
    },
}

// Interactive story with onChange
export const Interactive: Story = {
    args: {
        value: '# Type here to test the editor\n',
        height: '200px',
    },
    render: (args) => {
        const [value, setValue] = useState(args.value)
        return (
            <div>
                <LightEditor {...args} value={value} onChange={setValue} />
                <pre style={{ marginTop: '16px', padding: '8px', background: '#f0f0f0', borderRadius: '4px' }}>
                    Current value: {JSON.stringify(value)}
                </pre>
            </div>
        )
    },
}

// Need to import useState for interactive story
import { useState } from 'react'
