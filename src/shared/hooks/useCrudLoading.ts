import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { useLoading } from './useLoading';

interface CrudOperations<T> {
  create?: (data: Omit<T, 'id'>) => Promise<T>;
  read?: (id: string) => Promise<T>;
  update?: (id: string, data: T) => Promise<T>;
  delete?: (id: string) => Promise<void>;
  list?: (params?: any) => Promise<{ data: T[] }>;
}

interface CrudOptions {
  onSuccess?: (operation: string, result?: any) => void;
  onError?: (operation: string, error: any) => void;
  successMessages?: {
    create?: string;
    update?: string;
    delete?: string;
    read?: string;
    list?: string;
  };
  errorMessages?: {
    create?: string;
    update?: string;
    delete?: string;
    read?: string;
    list?: string;
  };
}

export const useCrudLoading = <T extends { id?: string }>(
  resourceName: string,
  operations: CrudOperations<T>,
  options: CrudOptions = {}
) => {
  const { withLoading, isLoading } = useLoading();

  const {
    onSuccess,
    onError,
    successMessages = {},
    errorMessages = {}
  } = options;

  const defaultSuccessMessages = {
    create: `${resourceName} created successfully`,
    update: `${resourceName} updated successfully`,
    delete: `${resourceName} deleted successfully`,
    read: `${resourceName} loaded successfully`,
    list: `${resourceName}s loaded successfully`,
    ...successMessages
  };

  const defaultErrorMessages = {
    create: `Failed to create ${resourceName}`,
    update: `Failed to update ${resourceName}`,
    delete: `Failed to delete ${resourceName}`,
    read: `Failed to load ${resourceName}`,
    list: `Failed to load ${resourceName}s`,
    ...errorMessages
  };

  const executeOperation = useCallback(async (
    operation: keyof CrudOperations<T>,
    loadingKey: string,
    operationFn: () => Promise<any>
  ) => {
    return await withLoading(loadingKey, operationFn, {
      onSuccess: (result) => {
        toast.success(defaultSuccessMessages[operation]);
        onSuccess?.(operation, result);
      },
      onError: (error) => {
        toast.error(defaultErrorMessages[operation]);
        onError?.(operation, error);
      }
    });
  }, [withLoading, onSuccess, onError, defaultSuccessMessages, defaultErrorMessages]);

  const create = useCallback(async (data: Omit<T, 'id'>) => {
    if (!operations.create) throw new Error('Create operation not defined');
    
    return await executeOperation(
      'create',
      `${resourceName}_create`,
      () => operations.create!(data)
    );
  }, [operations.create, executeOperation, resourceName]);

  const read = useCallback(async (id: string) => {
    if (!operations.read) throw new Error('Read operation not defined');
    
    return await executeOperation(
      'read',
      `${resourceName}_read_${id}`,
      () => operations.read!(id)
    );
  }, [operations.read, executeOperation, resourceName]);

  const update = useCallback(async (id: string, data: T) => {
    if (!operations.update) throw new Error('Update operation not defined');
    
    return await executeOperation(
      'update',
      `${resourceName}_update_${id}`,
      () => operations.update!(id, data)
    );
  }, [operations.update, executeOperation, resourceName]);

  const remove = useCallback(async (id: string) => {
    if (!operations.delete) throw new Error('Delete operation not defined');
    
    return await executeOperation(
      'delete',
      `${resourceName}_delete_${id}`,
      () => operations.delete!(id)
    );
  }, [operations.delete, executeOperation, resourceName]);

  const list = useCallback(async (params?: any) => {
    if (!operations.list) throw new Error('List operation not defined');
    
    return await executeOperation(
      'list',
      `${resourceName}_list`,
      () => operations.list!(params)
    );
  }, [operations.list, executeOperation, resourceName]);

  // Loading state checkers
  const isCreating = useCallback(() => isLoading(`${resourceName}_create`), [isLoading, resourceName]);
  const isReading = useCallback((id: string) => isLoading(`${resourceName}_read_${id}`), [isLoading, resourceName]);
  const isUpdating = useCallback((id: string) => isLoading(`${resourceName}_update_${id}`), [isLoading, resourceName]);
  const isDeleting = useCallback((id: string) => isLoading(`${resourceName}_delete_${id}`), [isLoading, resourceName]);
  const isListing = useCallback(() => isLoading(`${resourceName}_list`), [isLoading, resourceName]);

  return {
    // Operations
    create,
    read,
    update,
    remove,
    list,
    // Loading states
    isCreating,
    isReading,
    isUpdating,
    isDeleting,
    isListing,
    // Direct access to loading hook
    isLoading,
    withLoading
  };
};