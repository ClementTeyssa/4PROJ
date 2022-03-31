To add a service account authentication token to a kubeconfig file:

    If you haven't already done so, follow the steps to set up the cluster's kubeconfig configuration file and (if necessary) set the KUBECONFIG environment variable to point to the file. Note that you must set up your own kubeconfig file. You cannot access a cluster using a kubeconfig file that a different user set up. See Setting Up Cluster Access.

    In a terminal window, create a new service account in the kube-system namespace by entering the following kubectl command:

    $ kubectl -n kube-system create serviceaccount <service-account-name>

    For example, to create a service account called kubeconfig-sa, enter:

    $ kubectl -n kube-system create serviceaccount kubeconfig-sa

    The output from the above command confirms the creation of the service account. For example:

    serviceaccount/kubeconfig-sa created

    Note that creating the service account in the kube-system namespace is recommended good practice, and is assumed in the instructions in this topic. However, if you prefer, you can create the service account in another namespace to which you have access.

    Create a new clusterrolebinding with cluster administration permissions and bind it to the service account you just created by entering the following kubectl command:

    $ kubectl create clusterrolebinding <binding-name> --clusterrole=cluster-admin --serviceaccount=kube-system:<service-account-name>

    For example, to create a clusterrolebinding called add-on-cluster-admin and bind it to the kubeconfig-sa service account, enter:

    $ kubectl create clusterrolebinding add-on-cluster-admin --clusterrole=cluster-admin --serviceaccount=kube-system:kubeconfig-sa

    The output from the above command confirms the creation of the clusterrolebinding. For example:

    clusterrolebinding.rbac.authorization.k8s.io/add-on-cluster-admin created

    Obtain the name of the service account authentication token and assign its value to an environment variable by entering the following command (these instructions assume you specify TOKENNAME as the name of the environment variable):

    $ TOKENNAME=`kubectl -n kube-system get serviceaccount/<service-account-name> -o jsonpath='{.secrets[0].name}'`

    For example:

    $ TOKENNAME=`kubectl -n kube-system get serviceaccount/kubeconfig-sa -o jsonpath='{.secrets[0].name}'`

    Obtain the value of the service account authentication token and assign its value (decoded from base64) to an environment variable. These instructions assume you specify TOKEN as the name of the environment variable. The commands to enter depend on the operating system:

        To obtain the value of the service account authentication token in a MacOS, Linux, or Unix environment, enter the following command:

        $ TOKEN=`kubectl -n kube-system get secret $TOKENNAME -o jsonpath='{.data.token}'| base64 --decode`

        To obtain the value of the service account authentication token in a Windows environment:

            Enter the following command:

            $ kubectl -n kube-system get secret $TOKENNAME -o jsonpath='{.data.token}'

            Copy the output from the above command and paste it into a base64 decoder (for example, https://www.base64decode.org, https://www.base64decode.net, or similar).
            Copy the output from the base64 decoder.

            Enter the following command:

            $ TOKEN=`[<base64-decoded-output>]`

            where <base64-decoded-output> is the output you copied from the base64 decorder.

    Add the service account (and its authentication token) as a new user definition in the kubeconfig file by entering the following kubectl command:

    $ kubectl config set-credentials <service-account-name> --token=$TOKEN

    The service account (and its authentication token) is added to the list of users defined in the kubeconfig file.

    For example, to add the kubeconfig-sa service account and its authentication token to the kubeconfig file, enter:

    $ kubectl config set-credentials kubeconfig-sa --token=$TOKEN

    The output from the above command confirms the service account has been added to the kubeconfig file. For example:

    User "kubeconfig-sa" set.

    Set the user specified in the kubeconfig file for the current context to be the new service account user you created, by entering the following kubectl command:

    $ kubectl config set-context --current --user=<service-account-name>

    For example:

    $ kubectl config set-context --current --user=kubeconfig-sa

    The output from the above command confirms the current context has been changed. For example:

    Context "context-ctdiztdhezd" modified.

    (Optional) To verify that authentication works as expected, run a kubectl command to confirm that the service account user can be successfully authenticated using the service account authentication token.

    For example, if you have previously deployed a sample Nginx application on the cluster (see Deploying a Sample Nginx App on a Cluster Using Kubectl), enter the following command:

    $ kubectl get pods

    The output from the above command shows the pods running on the cluster. If the command runs successfully, the service account user in the kubeconfig file has been successfully authenticated using the service account authentication token.
    Distribute the kubeconfig file as necessary to enable other processes and tools (such as continuous integration and continuous delivery (CI/CD) tools) to access the cluster.
