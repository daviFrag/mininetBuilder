import {
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  SlideOptions,
  useBreakpointValue,
} from '@chakra-ui/react';
import { useMemo } from 'react';
import { useNetStore } from '../../data/zustand/net';
import EdgeProperties from '../Properties/Edges/EdgeProperties';
import ControllerNodeProperties from '../Properties/Nodes/ControllerNodeProperties';
import HostNodeProperties from '../Properties/Nodes/HostNodeProperties';
import SwitchNodeProperties from '../Properties/Nodes/SwitchNodeProperties';

type PlacementType = SlideOptions['direction'] | 'start' | 'end';

type PropertySideBarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const PropertySideBar = ({ isOpen, onClose }: PropertySideBarProps) => {
  const { getSelectedElement } = useNetStore();
  const respPlacement = useBreakpointValue<PlacementType>(
    {
      base: 'bottom',
      md: 'bottom',
      sm: 'bottom',
      xs: 'bottom',
      lg: 'right',
    },
    {
      // Breakpoint to use when mediaqueries cannot be used, such as in server-side rendering
      // (Defaults to 'base')
      fallback: 'lg',
    }
  );

  const selectedElement = getSelectedElement();
  console.log(selectedElement);

  const PropertyComponent = useMemo(() => {
    switch (selectedElement?.type) {
      case 'hostNode':
        return HostNodeProperties;
      case 'switchNode':
        return SwitchNodeProperties;
      case 'controllerNode':
        return ControllerNodeProperties;
      case 'dataEdge':
        return EdgeProperties;
      default:
        return Box;
    }
  }, [selectedElement?.type]);

  return (
    <Drawer
      placement={respPlacement}
      onClose={onClose}
      isOpen={isOpen}
      size={{ base: 'xs', xl: 'md' }}
    >
      <DrawerContent>
        <DrawerHeader borderBottomWidth="1px">
          <DrawerCloseButton />
          Properties
        </DrawerHeader>
        <DrawerBody>
          <PropertyComponent />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  );
};
