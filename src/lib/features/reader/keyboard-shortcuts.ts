/**
 * Keyboard shortcuts handler for PDF reader with vim-style navigation
 * Provides keyboard-driven control for all reader actions
 */

export interface KeyboardActions {
	scrollUp: (amount?: number) => void;
	scrollDown: (amount?: number) => void;
	previousPage: () => void;
	nextPage: () => void;
	goToStart: () => void;
	goToEnd: () => void;
	addBookmark: () => void;
	deleteBookmark: () => void;
	focusSearch: () => void;
	nextSearchResult: () => void;
	previousSearchResult: () => void;
	zoomIn: () => void;
	zoomOut: () => void;
	resetZoom: () => void;
	fitWidth: () => void;
	fitPage: () => void;
	toggleSidebar: () => void;
	goBack: () => void;
}

type KeyHandler = (event: KeyboardEvent) => void;

interface ShortcutConfig {
	key: string;
	shiftKey?: boolean;
	altKey?: boolean;
	ctrlKey?: boolean;
	metaKey?: boolean;
	allowInInput?: boolean;
	preventDefault?: boolean;
	action: () => void;
}

const SHORTCUT_SCROLL_AMOUNT = 50;

let keydownHandler: KeyHandler | null = null;

function isInputElement(target: EventTarget | null): boolean {
	if (!(target instanceof HTMLElement)) return false;
	return target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
}

function createKeyHandler(actions: KeyboardActions): KeyHandler {
	const shortcuts: ShortcutConfig[] = [
		{
			key: 'k',
			preventDefault: true,
			action: () => actions.scrollUp(SHORTCUT_SCROLL_AMOUNT)
		},
		{
			key: 'l',
			preventDefault: true,
			action: () => actions.scrollDown(SHORTCUT_SCROLL_AMOUNT)
		},
		{
			key: 'j',
			preventDefault: true,
			action: () => actions.previousPage()
		},
		{
			key: ' ',
			preventDefault: true,
			action: () => actions.nextPage()
		},
		{
			key: 'pagedown',
			preventDefault: true,
			action: () => actions.nextPage()
		},
		{
			key: 'h',
			preventDefault: true,
			action: () => actions.goToStart()
		},
		{
			key: 'g',
			shiftKey: true,
			preventDefault: true,
			action: () => actions.goToEnd()
		},
		{
			key: 'b',
			preventDefault: true,
			action: () => actions.addBookmark()
		},
		{
			key: 'B',
			shiftKey: true,
			preventDefault: true,
			action: () => actions.addBookmark()
		},
		{
			key: 'd',
			preventDefault: true,
			action: () => actions.deleteBookmark()
		},
		{
			key: 'D',
			shiftKey: true,
			preventDefault: true,
			action: () => actions.deleteBookmark()
		},
		{
			key: '/',
			allowInInput: false,
			preventDefault: true,
			action: () => actions.focusSearch()
		},
		{
			key: 'n',
			preventDefault: true,
			action: () => actions.nextSearchResult()
		},
		{
			key: 'N',
			shiftKey: true,
			preventDefault: true,
			action: () => actions.previousSearchResult()
		},
		{
			key: '+',
			preventDefault: true,
			action: () => actions.zoomIn()
		},
		{
			key: '=',
			preventDefault: true,
			action: () => actions.zoomIn()
		},
		{
			key: '-',
			preventDefault: true,
			action: () => actions.zoomOut()
		},
		{
			key: '0',
			preventDefault: true,
			action: () => actions.resetZoom()
		},
		{
			key: 'f',
			preventDefault: true,
			action: () => actions.fitWidth()
		},
		{
			key: 'F',
			shiftKey: true,
			preventDefault: true,
			action: () => actions.fitWidth()
		},
		{
			key: 'p',
			preventDefault: true,
			action: () => actions.fitPage()
		},
		{
			key: 'P',
			shiftKey: true,
			preventDefault: true,
			action: () => actions.fitPage()
		},
		{
			key: 'm',
			preventDefault: true,
			action: () => actions.toggleSidebar()
		},
		{
			key: 'M',
			shiftKey: true,
			preventDefault: true,
			action: () => actions.toggleSidebar()
		},
		{
			key: 'escape',
			allowInInput: true,
			preventDefault: false,
			action: () => actions.goBack()
		}
	];

	return (event: KeyboardEvent) => {
		const normalizedKey = event.key.toLowerCase();
		const isInputActive = isInputElement(event.target);

		for (const shortcut of shortcuts) {
			const shortcutKey = shortcut.key.toLowerCase();
			const keyMatches = normalizedKey === shortcutKey;
			const shiftMatches = !!shortcut.shiftKey === event.shiftKey;
			const altMatches = !!shortcut.altKey === event.altKey;
			const ctrlMatches = !!shortcut.ctrlKey === event.ctrlKey;
			const metaMatches = !!shortcut.metaKey === event.metaKey;

			if (keyMatches && shiftMatches && altMatches && ctrlMatches && metaMatches) {
				if (isInputActive && !shortcut.allowInInput) {
					continue;
				}

				if (shortcut.preventDefault) {
					event.preventDefault();
				}

				shortcut.action();
				return;
			}
		}
	};
}

export function initKeyboardShortcuts(
	container: HTMLElement,
	actions: KeyboardActions
): () => void {
	cleanupKeyboardShortcuts();

	keydownHandler = createKeyHandler(actions);
	window.addEventListener('keydown', keydownHandler);

	return cleanupKeyboardShortcuts;
}

export function cleanupKeyboardShortcuts(): void {
	if (keydownHandler) {
		window.removeEventListener('keydown', keydownHandler);
		keydownHandler = null;
	}
}
