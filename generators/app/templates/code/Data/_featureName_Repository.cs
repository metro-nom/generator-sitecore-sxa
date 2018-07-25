using Glass.Mapper.Sc;
using <%=featureNamespace%>.Data;
using <%=featureNamespace%>.Models;
using Sitecore.XA.Foundation.Mvc.Repositories.Base;

namespace <%=featureNamespace%>.Repositories
{
    public class <%=featureName%>Repository : ModelRepository, I<%=featureName%>Repository
    {
        private readonly ISitecoreService _sitecoreService;

        public <%=featureName%>Repository(ISitecoreService sitecoreService)
        {
            _sitecoreService = sitecoreService;
        }

        public override IRenderingModelBase GetModel()
        {
			if (this.Rendering.DataSourceItem == null)
                throw new System.NullReferenceException("Data source item is not specified");
			
            var model = _sitecoreService.Cast<<%=featureName%>RenderingModel>(this.Rendering.DataSourceItem);
            FillBaseProperties(model);
            return model;
        }
    }
}