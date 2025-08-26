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
    --action)
        P_ACTION=$2
        shift
        shift
        ;;
    --app-image)
        P_APP_IMAGE=$2
        shift
        shift
        ;;
    --app-version)
        P_APP_VERSION=$2
        shift
        shift
        ;;
    esac
done

if [[ "" == "${P_BRANCH}" ]]; then
    P_BRANCH="master"
fi

. "${script_dir}/env/${P_BRANCH}.env"

if [[ "" == "${P_ACTION}" ]]; then
    P_ACTION="build"
fi

if [[ "" == "${P_APP_IMAGE}" ]]; then
    P_APP_IMAGE="${ENV_APP_IMAGE}"
fi

if [[ "" == "${P_APP_VERSION}" ]]; then
    P_APP_VERSION="${ENV_APP_VERSION}"
fi

if [[ -z "${MAVEN_PATH}" ]]; then
    MAVEN_PATH="${HOME}/.m2/repository"
fi

if [[ "" == "${AZURE_TOKEN}" ]]; then
    AZURE_TOKEN="${ENV_AZURE_TOKEN}"
fi

# Obtener versión del package.json
PACKAGE_VERSION=$(jq -r .version <"${script_dir}/../../package.json")

if [[ "$P_APP_VERSION" != "$PACKAGE_VERSION" ]]; then
    echo "La versión del package.json no coincide con la versión del contenedor."
    echo "Versión del package.json: $PACKAGE_VERSION"
    echo "Versión del contenedor: $P_APP_VERSION"
    exit 1
fi

if [[ "version" == "${P_ACTION}" ]] ; then
    echo "${PACKAGE_VERSION}"
fi

if [[ "test" == "${P_ACTION}" ]]; then
    npm install
    npm test
fi

if [[ "build" == "${P_ACTION}" ]]; then
    cd "${script_dir}/../.."
    # pnpm install
    # pnpm build
    if [[ -z "$(which podman)" ]]; then
        DOCKER_BUILDKIT=1 docker build -f Dockerfile -t "${P_APP_IMAGE}:${P_APP_VERSION}" .
    else
        podman build -f Dockerfile -t "${P_APP_IMAGE}:${P_APP_VERSION}" .
    fi
fi

export NEXUS_PASSWORD=
