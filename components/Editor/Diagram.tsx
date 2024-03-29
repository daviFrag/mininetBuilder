import { Flex, useDisclosure } from '@chakra-ui/react';
import React, { useCallback, useState } from 'react';
import ReactFlow, {
  Background,
  Controls,
  EdgeMouseHandler,
  MiniMap,
  Node,
  NodeMouseHandler,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
  ReactFlowProvider,
  XYPosition,
  useOnSelectionChange,
  useReactFlow,
  useStoreApi,
} from 'reactflow';

import 'reactflow/dist/style.css';
import { useNetStore } from '../../data/zustand/net';
import ControllerEdge from '../Edges/ControllerEdge';
import DataEdge from '../Edges/DataEdge';
import ContextMenu from '../Menu/ContextMenu';
import EditorNav from '../Navbars/EditorNav';
import ControllerNode from '../Nodes/ControllerNode';
import HostNode from '../Nodes/HostNode';
import SwitchNode from '../Nodes/SwitchNode';
import { PropertySideBar } from '../SideBar/PropertySideBar';
import { TerminalPanel } from '../Terminal';

export type OnPaneContextMenu = (event: React.MouseEvent) => void;

export type DiagramProps = {};

const edgeTypes = {
  dataEdge: DataEdge,
  controllerEdge: ControllerEdge,
};

const nodeTypes = {
  switchNode: SwitchNode,
  hostNode: HostNode,
  controllerNode: ControllerNode,
};

const Diagram = ({}: DiagramProps) => {
  const {
    createEdge,
    getReactFlowEdges,
    getReactFlowNodes,
    applyNodeChanges,
    applyEdgeChanges,
    setSelectedElement,
  } = useNetStore();
  const { fitView } = useReactFlow();

  const { resetSelectedElements } = useStoreApi().getState();

  // const [selectedElement, setSelectedElement] = useState<Node | Edge>();

  useOnSelectionChange({
    onChange: ({ nodes, edges }) => {
      if (nodes.length > 0)
        return setSelectedElement({ type: 'node', id: nodes[0].id });
      if (edges.length > 0)
        return setSelectedElement({ type: 'edge', id: edges[0].id });
      setSelectedElement(undefined);
    },
  });

  const nodeColor = (node: Node) => {
    switch (node.type) {
      case 'switchNode':
        return '#6ede87';
      case 'hostNode':
        return '#6865A5';
      case 'controllerNode':
        return '#ff0072';
      default:
        return '##8B0000';
    }
  };

  const {
    isOpen: isOpenTerminal,
    onOpen: onOpenTerminal,
    onClose: onCloseTerminal,
  } = useDisclosure();
  const {
    isOpen: isOpenMenu,
    onOpen: onOpenMenu,
    onClose: onCloseMenu,
  } = useDisclosure();
  const {
    isOpen: isOpenProperty,
    onOpen: onOpenProperty,
    onClose: onCloseProperty,
  } = useDisclosure();
  const [menuPos, setMenuPos] = useState<XYPosition>({ x: 0, y: 0 });

  const onNodesChange = useCallback<OnNodesChange>(
    (changes) => applyNodeChanges(changes),
    [applyNodeChanges]
  );
  const onEdgesChange = useCallback<OnEdgesChange>(
    (changes) => applyEdgeChanges(changes),
    [applyEdgeChanges]
  );

  const onConnect = useCallback<OnConnect>(
    (params) => createEdge(params),
    [createEdge]
  );

  const onPaneContextMenu = useCallback<OnPaneContextMenu>(
    (e) => {
      e.preventDefault();

      // const rect = e.currentTarget.getBoundingClientRect();
      const pos = {
        x: e.clientX,
        y: e.clientY,
      };
      setMenuPos(pos);
      onOpenMenu();
    },
    [onOpenMenu]
  );

  const onPaneClick = (e: React.MouseEvent) => {
    e.preventDefault();

    onCloseMenu();
  };

  const onNodeClick: NodeMouseHandler = (e, node) => {
    e.preventDefault();
    // const rect = e.currentTarget.getBoundingClientRect();
    const pos = {
      x: e.clientX,
      y: e.clientY,
    };

    fitView({ nodes: [node], duration: 800, minZoom: 4, maxZoom: 6 });

    setMenuPos(pos);
    onOpenProperty();
  };

  const onEdgeClick: EdgeMouseHandler = (e, edge) => {
    e.preventDefault();
    // const rect = e.currentTarget.getBoundingClientRect();
    const pos = {
      x: e.clientX,
      y: e.clientY,
    };

    fitView({
      nodes: getReactFlowNodes().filter(
        (node) => node.id == edge.source || node.id == edge.target
      ),
      duration: 800,
      minZoom: 2,
      maxZoom: 4,
    });

    setMenuPos(pos);
    onOpenProperty();
  };

  return (
    <Flex direction={'column'} h="100vh" w="100vw">
      <EditorNav onOpenTerminal={onOpenTerminal} />
      <ReactFlow
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        nodes={getReactFlowNodes()}
        edges={getReactFlowEdges()}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onConnect={onConnect}
        onPaneClick={onPaneClick}
        onPaneContextMenu={onPaneContextMenu}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap nodeColor={nodeColor} zoomable pannable />
      </ReactFlow>
      <ContextMenu
        coordinate={menuPos}
        isOpen={isOpenMenu}
        onClose={onCloseMenu}
      />
      <PropertySideBar
        isOpen={isOpenProperty}
        onClose={() => {
          fitView({ nodes: getReactFlowNodes(), duration: 800 });
          resetSelectedElements();
          onCloseProperty();
        }}
      />
      <TerminalPanel isOpen={isOpenTerminal} onClose={onCloseTerminal} />
    </Flex>
  );
};

const DiagramWithProvider = (props: DiagramProps) => {
  return (
    <ReactFlowProvider>
      <Diagram {...props} />
    </ReactFlowProvider>
  );
};

export default DiagramWithProvider;
