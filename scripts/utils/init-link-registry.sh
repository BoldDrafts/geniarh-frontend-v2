#!/bin/bash
set -e

script_dir=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)

while [[ $# -gt 0 ]]; do
  case "$1" in
    --branch)
        P_BRANCH=$2
        shift
        shift
        ;;
    --username)
        P_USERNAME=$2
        shift
        shift
        ;;
    --password)
        P_PASSWORD=$2
        shift
        shift
        ;;
    --namespace)
        P_NAMESPACE=$2
        shift
        shift
        ;;
  esac
done

KUBECTL_COMMAND="${script_dir}/bin/kubectl --kubeconfig ${script_dir}/.kube/config"

if [[ "" == "${P_BRANCH}" ]] ; then
    P_BRANCH="master"
fi

. "${script_dir}/env/${P_BRANCH}.env"

if [[ "" == "${P_K8S_SECRET_REGISTRY}" ]] ; then
    P_K8S_SECRET_REGISTRY="${ENV_K8S_SECRET_REGISTRY}"
fi

if [[ "" == "${P_USERNAME}" ]]; then
    echo "Ingrese parametro --username"
    exit 0
fi

if [[ "" == "${P_PASSWORD}" ]]; then
    echo "Ingrese parametro --password"
    exit 0
fi

if [[ "" == "${P_K8S_NAMESPACE}" ]] ; then
    P_K8S_NAMESPACE="${ENV_NAMESPACE}"
fi

if [[ "" == "${P_IMG_REGISTRY_DOMAIN}" ]] ; then
    P_IMG_REGISTRY_DOMAIN="${ENV_IMG_REGISTRY_DOMAIN}"
fi


${KUBECTL_COMMAND} create secret docker-registry ${P_K8S_SECRET_REGISTRY} --namespace ${P_K8S_NAMESPACE} --docker-server="${P_IMG_REGISTRY_DOMAIN}" --docker-username="${P_USERNAME}" --docker-password="${P_PASSWORD}"
