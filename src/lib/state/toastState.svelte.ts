type ToastType = 'success' | 'error' | 'info';

interface Toast {
	id: string;
	message: string;
	type: ToastType;
	duration: number;
	createdAt: number;
}

/**
 * Global toast notification state
 * Manages toast queue with auto-dismiss
 */
function createToastState() {
	let toasts = $state<Toast[]>([]);

	/**
	 * Generate unique ID for toast
	 */
	function generateId(): string {
		return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
	}

	/**
	 * Show a toast notification
	 */
	function show(message: string, type: ToastType = 'info', duration = 3000): string {
		const id = generateId();
		const toast: Toast = {
			id,
			message,
			type,
			duration,
			createdAt: Date.now()
		};

		toasts = [...toasts, toast];

		// Auto-dismiss
		setTimeout(() => {
			dismiss(id);
		}, duration);

		return id;
	}

	/**
	 * Dismiss a specific toast by ID
	 */
	function dismiss(id: string): void {
		toasts = toasts.filter((t) => t.id !== id);
	}

	/**
	 * Dismiss all toasts
	 */
	function dismissAll(): void {
		toasts = [];
	}

	/**
	 * Show error toast (longer duration)
	 */
	function showError(message: string): string {
		return show(message, 'error', 5000);
	}

	/**
	 * Show success toast
	 */
	function showSuccess(message: string): string {
		return show(message, 'success', 3000);
	}

	/**
	 * Show info toast
	 */
	function showInfo(message: string): string {
		return show(message, 'info', 3000);
	}

	return {
		get toasts() {
			return toasts;
		},
		show,
		showError,
		showSuccess,
		showInfo,
		dismiss,
		dismissAll
	};
}

export const toastState = createToastState();
export type { Toast, ToastType };
