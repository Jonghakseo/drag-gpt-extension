/* eslint-disable react/no-children-prop */
/* eslint-disable react/jsx-no-undef */
import {
  ComponentPropsWithRef,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Box,
  Input,
  InputGroup,
  InputLeftElement,
  List,
  ListItem,
  CloseButton,
  HStack,
  Stack,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import styled from "@emotion/styled";
import type { PositionOnScreen } from "@pages/content/src/ContentScriptApp/utils/getPositionOnScreen";
import useRootOutsideClick from "@pages/content/src/ContentScriptApp/hooks/useRootOutsideClick";
import getSafePixel from "@pages/content/src/ContentScriptApp/utils/getSafePixel";
import { COLORS, Z_INDEX } from "@src/constant/style";
import DraggableBox from "@pages/content/src/ContentScriptApp/components/DraggableBox";

const commands = [
  {
    label: "Create new file",
    description: "Create a new file in the current directory",
    onClick: () => {
      // Code to create new file goes here
    },
  },
  {
    label: "Open terminal",
    description: "Open a new terminal window",
    onClick: () => {
      // Code to open new terminal window goes here
    },
  },
  // More commands can be added here...
];

const GAP = 8;

const MessageBoxContainer = styled.div<{ width: number }>`
  background: ${COLORS.CONTENT_BACKGROUND};
  display: flex;
  flex-direction: column;
  position: absolute;
  z-index: ${Z_INDEX.ROOT};

  white-space: pre-wrap;

  width: ${(p) => p.width}px;
  min-width: ${(p) => p.width}px;
  max-width: ${(p) => p.width}px;

  border-radius: 6px;
  padding: 12px;
  font-size: 14px;
  line-height: 16px;
  p {
    margin: 0;
  }
`;

const StyledCloseButton = styled(CloseButton)`
  cursor: pointer;
  margin: 0;
  background: transparent;
  border: none;
  outline: none;
  padding: 6px;
  border-radius: 4px;

  &:active {
    outline: none;
    transform: scale(0.9);
    transition: all ease-in-out 100ms;
  }
`;

export type MessageBoxProps = {
  isOutsideClickDisabled?: boolean;
  anchorTop: number;
  anchorCenter: number;
  anchorBottom: number;
  header: ReactNode;
  content: ReactNode;
  footer?: ReactNode;
  width: number;
  onClose: () => void;
  positionOnScreen: PositionOnScreen;
} & ComponentPropsWithRef<"div">;

const CommandPalette = ({
  anchorCenter,
  anchorTop,
  anchorBottom,
  header,
  width,
  content,
  onClose,
  positionOnScreen,
  footer,
  isOutsideClickDisabled,
  ...restProps
}: MessageBoxProps) => {
  const { isOpen, onOpen, onClose: onClose1 } = useDisclosure();
  const [searchTerm, setSearchTerm] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);

  useRootOutsideClick({
    ref: containerRef,
    isDisabled: isOutsideClickDisabled,
    handler: onClose,
  });

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }
    const boxCenterPosition = anchorCenter - width / 2;
    const height = containerRef.current.getBoundingClientRect().height;

    switch (positionOnScreen) {
      case "topLeft":
      case "topRight": {
        containerRef.current.style.top = getSafePixel(anchorBottom + GAP);
        containerRef.current.style.left = getSafePixel(boxCenterPosition);
        return;
      }
      case "bottomLeft":
      case "bottomRight": {
        containerRef.current.style.top = getSafePixel(anchorTop - GAP - height);
        containerRef.current.style.left = getSafePixel(boxCenterPosition);
        return;
      }
    }
  }, [containerRef, anchorCenter, anchorBottom, anchorTop, positionOnScreen]);

  const containerRefRect = useMemo(() => {
    return containerRef.current?.getBoundingClientRect();
  }, [containerRef.current]);

  const handleInputChange = (event: any) => {
    setSearchTerm(event.target.value);
  };

  const handleCommandClick = (command: any) => {
    command.onClick();
    onClose();
  };

  return (
    <DraggableBox
      defaultX={containerRefRect?.x ?? 0}
      defaultY={containerRefRect?.y ?? 0}
    >
      <MessageBoxContainer width={width} ref={containerRef} {...restProps}>
        <Stack>
          <HStack justifyContent="space-between">
            {typeof header === "string" ? (
              <Text color="black" fontWeight="bold">
                {header}
              </Text>
            ) : (
              header
            )}
            <StyledCloseButton color="black" size="sm" onClick={onClose} />
          </HStack>
          <HStack>
            <InputGroup>
              {/* eslint-disable-next-line react/no-children-prop */}
              <InputLeftElement
                pointerEvents="none"
                children={<SearchIcon />}
              />
              <Input
                placeholder="Search commands..."
                onClick={onOpen}
                value={searchTerm}
                onChange={handleInputChange}
              />
            </InputGroup>
          </HStack>
          <HStack>
            {isOpen && (
              <Box
                position="absolute"
                top="100%"
                left="0"
                right="0"
                boxShadow="md"
                border="1px"
                borderColor="gray.200"
                borderRadius="md"
                bg="white"
                zIndex={999}
              >
                <List>
                  {commands.map((command) => (
                    <ListItem
                      key={command.label}
                      onClick={() => handleCommandClick(command)}
                      cursor="pointer"
                      px={4}
                      py={2}
                      _hover={{ bg: "gray.100" }}
                    >
                      <Text fontWeight="bold">{command.label}</Text>
                      <Text color="gray.500" fontSize="sm">
                        {command.description}
                      </Text>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </HStack>
          {footer}
        </Stack>
      </MessageBoxContainer>
    </DraggableBox>
  );
};

export default CommandPalette;
