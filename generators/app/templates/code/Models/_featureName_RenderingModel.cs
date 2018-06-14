using System.Runtime.Serialization;
using Glass.Mapper.Sc.Configuration.Attributes;
using Glass.Mapper.Sc.Fields;
using <%=featureNamespace%>.Constants;
using Sitecore.XA.Foundation.Mvc.Models;

namespace <%=featureNamespace%>.Models
{
    [SitecoreType(AutoMap = true, Cachable = true)]
    [DataContract]
    public class <%=featureName%>RenderingModel : RenderingModelBase
    {
    }
}