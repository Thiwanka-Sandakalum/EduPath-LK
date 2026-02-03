import React, { useEffect, useRef, useState } from 'react';
import { Title, Text, Group, Button, Tabs, TextInput, Avatar, Stack, Card, Switch, Select, FileInput, Box, Table, PasswordInput } from '@mantine/core';
import { User, Shield, Upload, Save, Check } from 'lucide-react';
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
                    <Tabs.Tab value="security" leftSection={<Shield size={16} />}>Security</Tabs.Tab>
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
            </Tabs>
        </Stack>
    );
};

export default Settings;