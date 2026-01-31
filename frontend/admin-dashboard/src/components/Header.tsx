import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  Bell, 
  HelpCircle, 
  Plus,
  School,
  BookOpen,
  GraduationCap, 
  Users, 
  Sun, 
  Moon,
  FileText,
  Mail,
  Check,
  Phone,
  Keyboard,
  ArrowRight
} from 'lucide-react';
import { 
  Group, 
  TextInput, 
  ActionIcon, 
  Burger, 
  Menu, 
  Button, 
  Text, 
  Indicator, 
  Modal, 
  Kbd,
  Stack,
  ThemeIcon,
  Box,
  useMantineColorScheme
} from '@mantine/core';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  opened: boolean;
  toggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ opened, toggle }) => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(3);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [helpContent, setHelpContent] = useState<{title: string, content: React.ReactNode} | null>(null);

  const executeSearch = () => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return;

    const studentKeywords = ['student', 'user', 'profile', 'name', 'id'];
    const courseKeywords = ['course', 'degree', 'bsc', 'msc', 'diploma', 'engineering', 'medicine', 'arts', 'science'];
    const scholarshipKeywords = ['scholarship', 'grant', 'aid', 'bursary', 'fund'];

    if (studentKeywords.some(k => term.includes(k))) {
        navigate(`/admin/students?search=${encodeURIComponent(term)}`);
    } else if (courseKeywords.some(k => term.includes(k))) {
        navigate(`/admin/courses?search=${encodeURIComponent(term)}`);
    } else if (scholarshipKeywords.some(k => term.includes(k))) {
        navigate(`/admin/scholarships?search=${encodeURIComponent(term)}`);
    } else {
        navigate(`/admin/institutions?search=${encodeURIComponent(term)}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') executeSearch();
  };

  const openHelp = (type: string) => {
    let content: React.ReactNode;
    if (type === 'Documentation') {
        content = (
            <Stack>
                <Text size="sm" c="dimmed">Access the official EduPath LK administrator guides.</Text>
                <Group>
                    <ThemeIcon variant="light"><FileText size={16} /></ThemeIcon>
                    <Box>
                        <Text size="sm" fw={500}>Getting Started Guide</Text>
                        <Text size="xs" c="dimmed">Learn the basics of dashboard.</Text>
                    </Box>
                </Group>
                <Group>
                    <ThemeIcon variant="light"><Check size={16} /></ThemeIcon>
                    <Box>
                        <Text size="sm" fw={500}>Verification Process</Text>
                        <Text size="xs" c="dimmed">How to approve institutions.</Text>
                    </Box>
                </Group>
            </Stack>
        );
    } else if (type === 'Support') {
        content = (
            <Stack>
                <Text size="sm" c="dimmed">Reach out to our technical team.</Text>
                <Group>
                    <ThemeIcon color="green" variant="light"><Mail size={16} /></ThemeIcon>
                    <Box>
                        <Text size="sm" fw={500}>Email Us</Text>
                        <Text size="xs">support@edupath.lk</Text>
                    </Box>
                </Group>
                <Group>
                    <ThemeIcon color="grape" variant="light"><Phone size={16} /></ThemeIcon>
                    <Box>
                        <Text size="sm" fw={500}>Hotline</Text>
                        <Text size="xs">+94 11 234 5678</Text>
                    </Box>
                </Group>
            </Stack>
        );
    } else {
        content = (
            <Stack gap="xs">
                <Group justify="space-between">
                    <Text size="sm">Global Search</Text>
                    <Group gap={4}><Kbd>Ctrl</Kbd> + <Kbd>K</Kbd></Group>
                </Group>
                <Group justify="space-between">
                    <Text size="sm">Execute Search</Text>
                    <Kbd>Enter</Kbd>
                </Group>
                <Group justify="space-between">
                    <Text size="sm">Close Modals</Text>
                    <Kbd>Esc</Kbd>
                </Group>
            </Stack>
        );
    }
    setHelpContent({ title: type, content });
    setHelpModalOpen(true);
  };

  return (
    <Group h="100%" px="md" justify="space-between" style={{ backgroundColor: 'var(--mantine-color-body)', position: 'relative' }}>
      
      {/* Left Side: Logo & Branding */}
      <Group>
        <Burger opened={opened} onClick={toggle} hiddenFrom="md" size="sm" />
        <ThemeIcon size="lg" radius="md" variant="filled" color="blue" visibleFrom="xs">
            <GraduationCap size={20} />
        </ThemeIcon>
        <Box visibleFrom="xs">
            <Text fw={800} size="lg" lh={1} style={{ letterSpacing: '-0.5px' }}>EduPath<Text span c="blue" inherit>LK</Text></Text>
        </Box>
        <ThemeIcon size="lg" radius="md" variant="filled" color="blue" hiddenFrom="xs">
             <GraduationCap size={20} />
        </ThemeIcon>
      </Group>

      {/* Center: Search Bar */}
      <Box style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }} w={{ base: 180, sm: 360, md: 450 }}>
          <TextInput
            placeholder="Search universities, courses, or students..."
            leftSection={<Search size={16} />}
            rightSection={
              <ActionIcon size="sm" variant="transparent" c="dimmed" onClick={executeSearch}>
                  <ArrowRight size={14} />
              </ActionIcon>
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            radius="md"
            styles={{ input: { fontSize: '13px' } }}
          />
      </Box>

      {/* Right Side: Actions */}
      <Group gap="sm">
        <Menu shadow="md" width={240}>
          <Menu.Target>
            <Button 
                variant="filled" 
                color="blue" 
                leftSection={<Plus size={16} />}
                visibleFrom="sm"
                radius="md"
                size="sm"
            >
              Quick Add
            </Button>
          </Menu.Target>
          <Menu.Target>
             <ActionIcon variant="filled" color="blue" hiddenFrom="sm" size="lg" radius="md"><Plus size={18} /></ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Label>Create New</Menu.Label>
            <Menu.Item leftSection={<School size={14} />} onClick={() => navigate('/admin/institutions')}>
              Institution
            </Menu.Item>
            <Menu.Item leftSection={<BookOpen size={14} />} onClick={() => navigate('/admin/courses')}>
              Course
            </Menu.Item>
            <Menu.Item leftSection={<GraduationCap size={14} />} onClick={() => navigate('/admin/scholarships')}>
              Scholarship
            </Menu.Item>
            <Menu.Item leftSection={<Users size={14} />} onClick={() => navigate('/admin/students')}>
              Student
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>

        <ActionIcon variant="default" size="lg" radius="md" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
        </ActionIcon>

        <Menu shadow="md" width={300} withArrow>
          <Menu.Target>
            <Indicator inline disabled={unreadCount === 0} color="red" size={8} offset={4}>
              <ActionIcon variant="default" size="lg" radius="md">
                <Bell size={18} />
              </ActionIcon>
            </Indicator>
          </Menu.Target>

          <Menu.Dropdown>
             <Menu.Label>Notifications</Menu.Label>
             {[
                { title: 'New Student Registration', desc: 'Amal Perera joined', time: '2m ago' },
                { title: 'System Maintenance', desc: 'Scheduled tonight 2AM', time: '1h ago' },
                { title: 'Scholarship Alert', desc: 'Deadline approaching', time: '4h ago' }
             ].map((n, i) => (
                 <Menu.Item key={i}>
                    <Text size="sm" fw={500}>{n.title}</Text>
                    <Text size="xs" c="dimmed">{n.desc} • {n.time}</Text>
                 </Menu.Item>
             ))}
             <Menu.Divider />
             <Menu.Item onClick={() => setUnreadCount(0)} color="blue">
                Mark all as read
             </Menu.Item>
          </Menu.Dropdown>
        </Menu>

        <Menu shadow="md" width={200} withArrow>
            <Menu.Target>
                <ActionIcon variant="default" size="lg" visibleFrom="xs" radius="md">
                    <HelpCircle size={18} />
                </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
                <Menu.Label>Help & Support</Menu.Label>
                <Menu.Item leftSection={<FileText size={14} />} onClick={() => openHelp('Documentation')}>Documentation</Menu.Item>
                <Menu.Item leftSection={<Mail size={14} />} onClick={() => openHelp('Support')}>Contact Support</Menu.Item>
                <Menu.Item leftSection={<Keyboard size={14} />} onClick={() => openHelp('Shortcuts')}>Shortcuts</Menu.Item>
            </Menu.Dropdown>
        </Menu>
      </Group>

      <Modal opened={helpModalOpen} onClose={() => setHelpModalOpen(false)} title={helpContent?.title}>
         {helpContent?.content}
      </Modal>
    </Group>
  );
};

export default Header;