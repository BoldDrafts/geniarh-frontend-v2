#!/bin/bash
# Description: Common check functions for Kubernetes deployments
# Author: CMA Consulting
# Version: 1.0

# Load log.sh if not already loaded
if ! declare -f log >/dev/null; then
    source "$(dirname "${BASH_SOURCE[0]}")/log.sh"
fi

# Function: check_kubectl
# Description: Check if kubectl is installed and available
# Parameters: None
# Returns: 0 if kubectl is available, 1 otherwise
function check_kubectl() {
    if ! command -v kubectl &> /dev/null; then
        handle_error "kubectl not installed or not in PATH"
    fi
}

# Function: check_namespace_exists
# Description: Check if a namespace exists in Kubernetes
# Parameters: NAMESPACE (global variable)
# Returns: 0 if namespace exists, 1 otherwise
function check_namespace_exists() {
    kubectl get namespace "${NAMESPACE}" &> /dev/null
    return $?
}

# Function: check_cert_manager
# Description: Check if cert-manager is installed and running
# Parameters: None
# Returns: 0 if cert-manager is available, 1 otherwise
function check_cert_manager() {
    if ! kubectl get namespace cert-manager &> /dev/null; then
        log "WARN" "cert-manager namespace not detected in cluster"
        log "INFO" "It is recommended to install cert-manager for automatic certificate management"
        log "INFO" "See: https://cert-manager.io/docs/installation/"
        return 1
    fi
    
    if ! kubectl get deployments -n cert-manager cert-manager &> /dev/null; then
        log "WARN" "cert-manager deployment not detected in cert-manager namespace"
        log "WARN" "cert-manager may not be installed correctly"
        return 1
    fi
    
    return 0
}