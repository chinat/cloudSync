#ifndef GITHUB_H
#define GITHUB_H

#include <QNetworkAccessManager>
#include <QNetworkReply>

namespace GitHub {

    class Http : public QObject {
        Q_OBJECT
    public :
        enum Action {
            GET = 1,
            POST,
            DELETE,
            PATCH
        };
        
        Http(QObject *parent = NULL);
        
        
        
        QNetworkReply * gGet();
        QNetworkReply * gPost();
        QNetworkReply * gDelete();
        
    protected :
        QNetworkAccessManager * manager;
        
        
    };


}


#endif // GITHUB_H
