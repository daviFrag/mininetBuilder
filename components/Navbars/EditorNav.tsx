'use client';

import { ArrowRightIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Flex,
  HStack,
  Spacer,
  Stack,
  Text,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { useEffect } from 'react';
import { useReactFlow } from 'reactflow';
import { BACK_URL, loadTopology } from '../../data/api';
import { useNetStore } from '../../data/zustand/net';
import Nav from '../Layout/Nav';

type EditorNavProps = {
  onOpenTerminal: () => void;
};

export default function EditorNav({ onOpenTerminal }: EditorNavProps) {
  const { rearrangeTopo, getTopoJson, getReactFlowNodes } = useNetStore();
  const { fitView } = useReactFlow();

  const toast = useToast();

  useEffect(() => {
    const isMac =
      typeof window !== 'undefined'
        ? navigator.platform.toUpperCase().indexOf('MAC') >= 0
        : false;

    async function onKeyDown(e: KeyboardEvent) {
      if (e.key.toLowerCase() === 's' && (isMac ? e.metaKey : e.ctrlKey)) {
        e.preventDefault();
      }
      // TODO: new features
      // if (e.key.toLowerCase() === 'z' && (isMac ? e.metaKey : e.ctrlKey)) {
      //   e.preventDefault();
      // }
      // if (e.key.toLowerCase() === 'y' && (isMac ? e.metaKey : e.ctrlKey)) {
      //   e.preventDefault();
      // }
      if (e.key.toLowerCase() === 'f5' && (isMac ? e.metaKey : e.ctrlKey)) {
        e.preventDefault();
      }
    }

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const reorderGraph = (algo: string) => {
    return async () => {
      await rearrangeTopo(algo);
      fitView({ nodes: getReactFlowNodes(), duration: 800 });
    };
  };

  return (
    <Nav p={2} bg="gray.200" justify="start">
      <Stack align="start" w="full">
        <HStack w="full">
          <Text
            fontWeight={'bold'}
            borderWidth={2}
            borderColor={'blue.600'}
            borderRadius={'md'}
            padding={1}
            bg={'blue.400'}
          >
            Mininet Builder
          </Text>
          <DropDown
            name="File"
            options={[
              {
                name: 'Export JSON',
                shortcut: '',
                icon: <ExternalLinkIcon mr={2} />,
                onClick: () => {
                  window.open(
                    BACK_URL +
                      '/api/topology/download?json=' +
                      btoa(JSON.stringify(getTopoJson()))
                  );
                },
              },
            ]}
          />
          {/* TODO: next features */}
          {/* <DropDown
            name="Edit"
            options={[
              {
                name: 'Undo',
                shortcut: 'Ctrl+Z',
                // onClick: downloadJson,
              },
              {
                name: 'Redo',
                shortcut: 'Ctrl+Y',
                // onClick: downloadJson,
              },
            ]}
          /> */}
          <DropDown
            name="View"
            options={[
              {
                name: 'Rearrange Topology: Tree algorithm',
                icon: <ArrowRightIcon mr={2} />,
                onClick: reorderGraph('mrtree'),
              },
              {
                name: 'Rearrange Topology: Radial algorithm',
                icon: <ArrowRightIcon mr={2} />,
                onClick: reorderGraph('radial'),
              },
            ]}
          />
          <DropDown
            name="Run"
            options={[
              {
                name: 'Deploy network',
                shortcut: 'Ctrl+F5',
                onClick: async () => {
                  try {
                    const topo = getTopoJson();
                    toast({
                      title: 'Loading SDN..',
                      description: 'Loading network inside the VM',
                      status: 'info',
                      duration: 3000,
                      position: 'bottom-left',
                      isClosable: true,
                    });
                    await loadTopology(topo);
                    toast({
                      title: 'Deploy completed',
                      description: 'The deploy was successful',
                      status: 'success',
                      duration: 3000,
                      position: 'bottom-left',
                      isClosable: true,
                    });
                  } catch (err) {
                    toast({
                      title: 'Internal Error',
                      description: 'Try later',
                      status: 'error',
                      duration: 3000,
                      position: 'bottom-left',
                      isClosable: true,
                    });
                  }
                },
              },
            ]}
          />
          <DropDown
            name="Terminal"
            options={[
              {
                name: 'New Mininet Terminal',
                shortcut: 'Ctrl+T',
                onClick: onOpenTerminal,
              },
            ]}
          />
        </HStack>
      </Stack>
    </Nav>
  );
}

const DropDown = ({
  name,
  options,
}: {
  name: string;
  options: {
    name: string;
    shortcut?: string;
    icon?: React.ReactElement;
    onClick?: () => void;
  }[];
}) => {
  const { isOpen, onToggle, onClose } = useDisclosure();

  return (
    <Box>
      <Box
        width="100vw"
        height="100vh"
        position="absolute"
        left={0}
        top={0}
        onClick={onClose}
        zIndex={9}
        hidden={!isOpen}
      />
      <Button
        p={0}
        color="gray.600"
        bg={isOpen ? 'gray.300' : 'transparent'}
        _hover={{ bg: 'gray.300' }}
        onClick={() => onToggle()}
      >
        {name}
      </Button>
      <Box
        shadow={'lg'}
        position={'fixed'}
        bg="white"
        hidden={!isOpen}
        rounded="md"
        roundedTopLeft={'none'}
        zIndex={10}
      >
        {isOpen &&
          options.map((val, id) => (
            <Box
              role="button"
              key={id}
              color="black"
              bg={'transparent'}
              p={2}
              _hover={{ bg: 'gray.200' }}
              onClick={() => {
                val.onClick?.();
                onToggle();
              }}
            >
              <Flex align={'center'}>
                {val?.icon}
                <Text>{val.name}</Text>
                <Spacer minW={10} />
                <Text fontSize={'sm'} fontWeight={'semibold'} color="gray.500">
                  {val.shortcut}
                </Text>
              </Flex>
            </Box>
          ))}
      </Box>
    </Box>
  );
};
