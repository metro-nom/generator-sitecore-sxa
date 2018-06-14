using <%=featureNamespace%>.Data;
using Sitecore.XA.Foundation.Mvc.Controllers;
using System.Web.Mvc;

namespace <%=featureNamespace%>.Controllers
{
    public class <%=featureName%>Controller : StandardController
    {
        private readonly I<%=featureName%>Repository _repository;

        public <%=featureName%>Controller(I<%=featureName%>Repository repository)
        {
            _repository = repository;
        }
        
        protected override object GetModel()
        {
            return _repository.GetModel();
        }
    }
}