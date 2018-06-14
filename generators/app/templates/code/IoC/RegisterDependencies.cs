using <%=featureNamespace%>.Controllers;
using <%=featureNamespace%>.Data;
using <%=featureNamespace%>.Repositories;
using Microsoft.Extensions.DependencyInjection;
using Sitecore.DependencyInjection;

namespace <%=featureNamespace%>.IoC
{
    public class RegisterDependencies : IServicesConfigurator
    {
        public void Configure(IServiceCollection serviceCollection)
        {
            serviceCollection.AddTransient<I<%=featureName%>Repository, <%=featureName%>Repository>();
            serviceCollection.AddTransient<<%=featureName%>Controller>();
        }
    }
}