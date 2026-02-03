import React, { useEffect, useRef, useState } from 'react';
import { Title, Text, Group, Button, Tabs, TextInput, Avatar, Stack, Card, Switch, Select, FileInput, Box, Table, Badge, PasswordInput, Divider, ActionIcon } from '@mantine/core';
import { User, Bell, Shield, CreditCard, Upload, Save, Check, Download, CreditCard as CardIcon } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';

const Settings: React.FC = () => {
    const { user } = useUser();
    const [activeTab, setActiveTab] = useState<string | null>('general');

    const fileInputRef = useRef<any>(null);
    const [saved, setSaved] = useState(false);
    const [profile, setProfile] = useState(() => ({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.primaryEmailAddress?.emailAddress || '',
        role: 'Viewer',
        avatar: user?.imageUrl || '',
    }));

    useEffect(() => {
        setProfile((prev) => ({
            ...prev,
            firstName: user?.firstName || prev.firstName,
            lastName: user?.lastName || prev.lastName,
            email: user?.primaryEmailAddress?.emailAddress || prev.email,
            avatar: user?.imageUrl || prev.avatar,
        }));
    }, [user]);

    const handleAvatarChange = (file: File | null) => {
        if (!file) return;
        const url = URL.createObjectURL(file);
        setProfile((prev) => ({ ...prev, avatar: url }));
        setSaved(false);
    };

    const handleSave = () => {
        // Placeholder: wire to backend/profile store later.
        setSaved(true);
        window.setTimeout(() => setSaved(false), 1500);
    };

    return (
        <Stack>
            <Box>
                <Title order={2}>Settings</Title>
                <Text c="dimmed">Manage platform preferences.</Text>
            </Box>

            <Tabs value={activeTab} onChange={setActiveTab} variant="pills" orientation="vertical" defaultValue="general">
                <Tabs.List w={250}>
                    <Tabs.Tab value="general" leftSection={<User size={16} />}>General</Tabs.Tab>
                    <Tabs.Tab value="notifications" leftSection={<Bell size={16} />}>Notifications</Tabs.Tab>
                    <Tabs.Tab value="security" leftSection={<Shield size={16} />}>Security</Tabs.Tab>
                    <Tabs.Tab value="billing" leftSection={<CreditCard size={16} />}>Billing</Tabs.Tab>
                </Tabs.List>

                <Tabs.Panel value="general" pl="lg">
                    <Card withBorder radius="md">
                        <Title order={4} mb="lg">Profile Information</Title>
                        <Group mb="lg">
                            <Avatar src={profile.avatar} size={80} radius={80} color="blue">{profile.firstName[0]}</Avatar>
                            <Stack gap={4}>
                                <FileInput
                                    accept="image/png,image/jpeg"
                                    style={{ display: 'none' }}
                                    onChange={handleAvatarChange}
                                    ref={fileInputRef as any}
                                />
                                <Button
                                    variant="default"
                                    size="xs"
                                    leftSection={<Upload size={14} />}
                                    onClick={() => (fileInputRef.current as any)?.click()}
                                >
                                    Change Avatar
                                </Button>
                                <Text size="xs" c="dimmed">Max 800K</Text>
                            </Stack>
                        </Group>
                        <Group grow mb="md">
                            <TextInput label="First Name" value={profile.firstName} onChange={(e) => setProfile({ ...profile, firstName: e.target.value })} />
                            <TextInput label="Last Name" value={profile.lastName} onChange={(e) => setProfile({ ...profile, lastName: e.target.value })} />
                        </Group>
                        <TextInput label="Email" value={profile.email} mb="md" onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                        <Select label="Role" value={profile.role} data={['Super Admin', 'Viewer']} onChange={(val) => setProfile({ ...profile, role: val || '' })} mb="lg" />

                        <Group justify="flex-end">
                            <Button
                                onClick={handleSave}
                                leftSection={saved ? <Check size={16} /> : <Save size={16} />}
                                color={saved ? "green" : "blue"}
                            >
                                {saved ? "Saved Changes" : "Save Changes"}
                            </Button>
                        </Group>
                    </Card>
                </Tabs.Panel>

                <Tabs.Panel value="notifications" pl="lg">
                    <Card withBorder radius="md">
                        <Title order={4} mb="lg">Email Alerts</Title>
                        <Stack>
                            {['New Student Registration', 'Course Approval Requests', 'System Updates', 'Security Alerts'].map(label => (
                                <Group key={label} justify="space-between">
                                    <Text size="sm">{label}</Text>
                                    <Switch defaultChecked={['Security Alerts', 'System Updates'].includes(label)} />
                                </Group>
                            ))}
                        </Stack>
                    </Card>
                </Tabs.Panel>

                <Tabs.Panel value="security" pl="lg">
                    <Stack>
                        <Card withBorder radius="md">
                            <Title order={4} mb="md">Change Password</Title>
                            <Stack gap="md">
                                <PasswordInput label="Current Password" placeholder="••••••••" />
                                <PasswordInput label="New Password" placeholder="••••••••" />
                                <PasswordInput label="Confirm New Password" placeholder="••••••••" />
                                <Group justify="flex-end">
                                    <Button variant="light" color="blue">Update Password</Button>
                                </Group>
                            </Stack>
                        </Card>

                        <Card withBorder radius="md">
                            <Group justify="space-between" mb="xs">
                                <Box>
                                    <Title order={4}>Two-Factor Authentication</Title>
                                    <Text size="sm" c="dimmed">Add an extra layer of security to your account.</Text>
                                </Box>
                                <Switch size="lg" onLabel="ON" offLabel="OFF" />
                            </Group>
                        </Card>

                        <Card withBorder radius="md">
                            <Title order={4} mb="md">Recent Login Activity</Title>
                            <Table>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Device</Table.Th>
                                        <Table.Th>Location</Table.Th>
                                        <Table.Th>Time</Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    <Table.Tr>
                                        <Table.Td>Chrome on Windows</Table.Td>
                                        <Table.Td>Colombo, Sri Lanka</Table.Td>
                                        <Table.Td>Just now</Table.Td>
                                    </Table.Tr>
                                    <Table.Tr>
                                        <Table.Td>Safari on iPhone</Table.Td>
                                        <Table.Td>Kandy, Sri Lanka</Table.Td>
                                        <Table.Td>2 hours ago</Table.Td>
                                    </Table.Tr>
                                </Table.Tbody>
                            </Table>
                        </Card>
                    </Stack>
                </Tabs.Panel>

                <Tabs.Panel value="billing" pl="lg">
                    <Stack>
                        <Card withBorder radius="md" bg="blue.0" style={{ borderColor: 'var(--mantine-color-blue-2)' }}>
                            <Group justify="space-between">
                                <Box>
                                    <Text fw={700} size="lg" c="blue.9">Enterprise Plan</Text>
                                    <Text size="sm" c="blue.7">Unlimited admins, AI analytics, and priority support.</Text>
                                </Box>
                                <Badge size="lg" color="blue">Active</Badge>
                            </Group>
                        </Card>

                        <Card withBorder radius="md">
                            <Title order={4} mb="md">Payment Method</Title>
                            <Group justify="space-between" p="md" bg="var(--mantine-color-gray-0)" style={{ borderRadius: 8 }}>
                                <Group>
                                    <CardIcon size={24} />
                                    <Box>
                                        <Text fw={600}>Visa ending in 4242</Text>
                                        <Text size="xs" c="dimmed">Expiry 09/28</Text>
                                    </Box>
                                </Group>
                                <Button variant="subtle" size="xs">Edit</Button>
                            </Group>
                        </Card>

                        <Card withBorder radius="md">
                            <Title order={4} mb="md">Billing History</Title>
                            <Table>
                                <Table.Thead>
                                    <Table.Tr>
                                        <Table.Th>Invoice</Table.Th>
                                        <Table.Th>Date</Table.Th>
                                        <Table.Th>Amount</Table.Th>
                                        <Table.Th>Status</Table.Th>
                                        <Table.Th></Table.Th>
                                    </Table.Tr>
                                </Table.Thead>
                                <Table.Tbody>
                                    {[
                                        { id: 'INV-001', date: 'Oct 1, 2023', amount: '$499.00', status: 'Paid' },
                                        { id: 'INV-002', date: 'Sep 1, 2023', amount: '$499.00', status: 'Paid' },
                                        { id: 'INV-003', date: 'Aug 1, 2023', amount: '$499.00', status: 'Paid' },
                                    ].map((inv) => (
                                        <Table.Tr key={inv.id}>
                                            <Table.Td fw={500}>{inv.id}</Table.Td>
                                            <Table.Td>{inv.date}</Table.Td>
                                            <Table.Td>{inv.amount}</Table.Td>
                                            <Table.Td><Badge color="green" size="sm" variant="light">{inv.status}</Badge></Table.Td>
                                            <Table.Td>
                                                <ActionIcon variant="subtle" color="gray">
                                                    <Download size={16} />
                                                </ActionIcon>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </Table.Tbody>
                            </Table>
                        </Card>
                    </Stack>
                </Tabs.Panel>
            </Tabs>
        </Stack>
    );
};

export default Settings;